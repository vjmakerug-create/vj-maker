import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Play, Plus, Share2, Download, Star, Calendar, Clock, Lock, Crown, Check } from "lucide-react";
import NavbarCompact from "@/components/NavbarCompact";
import FooterCompact from "@/components/FooterCompact";
import MobileBottomNav from "@/components/MobileBottomNav";
import MovieCardCompact from "@/components/MovieCardCompact";
import EpisodeSelector from "@/components/EpisodeSelector";
import ArtPlayerVideo from "@/components/ArtPlayerVideo";
import LoginModal from "@/components/LoginModal";
import { useMovie, useMovies } from "@/hooks/useMovies";
import { getGoogleDriveEmbedUrl, getGoogleDriveDownloadUrl, getGoogleDriveDirectDownloadUrl } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

const Watch = () => {
  const { id } = useParams();
  const { movie: firebaseMovie, loading } = useMovie(id || "");
  const { movies: allMovies } = useMovies();
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { user } = useAuth();
  const { isSubscribed, setShowSubscriptionModal, daysRemaining } = useSubscription();
  
  // Determine if this is a series with episodes
  const isSeries = firebaseMovie?.type === "series" && firebaseMovie?.episodes && firebaseMovie.episodes.length > 0;
  const episodes = firebaseMovie?.episodes || [];
  
  // Check if URL is a direct video file (MP4, etc.)
  const isDirectVideoUrl = (url: string): boolean => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.ogg') || 
           lowerUrl.includes('.mp4?') || lowerUrl.includes('.webm?') || lowerUrl.includes('.ogg?');
  };
  
  // Get current video URL
  const getCurrentVideoUrl = (): string | null => {
    if (isSeries && episodes[currentEpisode]?.streamlink) {
      const url = episodes[currentEpisode].streamlink;
      if (isDirectVideoUrl(url)) return url;
      return getGoogleDriveEmbedUrl(url);
    }
    if (firebaseMovie?.streamlink) {
      const url = firebaseMovie.streamlink;
      if (isDirectVideoUrl(url)) return url;
      return getGoogleDriveEmbedUrl(url);
    }
    return null;
  };
  
  const videoUrl = getCurrentVideoUrl();
  const rawStreamlink = isSeries && episodes[currentEpisode]?.streamlink 
    ? episodes[currentEpisode].streamlink 
    : firebaseMovie?.streamlink || "";
  
  // Determine if we should use video tag or iframe
  const useVideoTag = isDirectVideoUrl(rawStreamlink);
  
  console.log("Watch page - Movie:", firebaseMovie?.title, "Source:", firebaseMovie?.source);
  
  // Check if this is VJ Confidential source
  const isConfidential = firebaseMovie?.source === "confidential";

  // Check if user can watch (must be subscribed)
  const canWatch = isSubscribed;
  
  // Generate proper download filename
  const getDownloadFilename = (): string => {
    const movieTitle = displayMovie?.title || "Video";
    const year = displayMovie?.year || "";
    const episodeInfo = isSeries && episodes[currentEpisode] 
      ? `_S${episodes[currentEpisode].season || 1}E${episodes[currentEpisode].episodeNumber}` 
      : "";
    
    const cleanTitle = `${movieTitle}${episodeInfo}${year ? `_${year}` : ""}`
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .trim();
    
    return `${cleanTitle || "VJ_Movie"}.mp4`;
  };
  
  // Download handler - requires subscription
  const handleDownload = async () => {
    if (!canWatch) {
      setShowSubscriptionModal(true);
      toast.error("Subscribe to download movies");
      return;
    }
    
    if (!rawStreamlink) return;
    try {
      setIsDownloading(true);
      const filename = getDownloadFilename();

      const triggerBlobDownload = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      };

      if (isDirectVideoUrl(rawStreamlink)) {
        await triggerBlobDownload(rawStreamlink);
      } else {
        // Try Cloudflare Worker first, fall back to direct Google Drive
        const workerUrl = getGoogleDriveDownloadUrl(rawStreamlink, filename);
        try {
          await triggerBlobDownload(workerUrl);
        } catch (workerError) {
          console.warn("Worker download failed, falling back to direct Google Drive:", workerError);
          const directUrl = getGoogleDriveDirectDownloadUrl(rawStreamlink);
          await triggerBlobDownload(directUrl);
        }
      }

      toast.success("Download started!");
      setTimeout(() => setIsDownloading(false), 2000);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed. Please try again.");
      setIsDownloading(false);
    }
  };

  // Watch Now handler - scroll to video
  const handleWatchNow = () => {
    // Scroll to top where video is
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Enjoy watching!");
  };

  // Add to List handler
  const handleAddToList = () => {
    setIsInList(!isInList);
    if (!isInList) {
      toast.success(`"${displayMovie?.title}" added to your list!`);
    } else {
      toast.success(`"${displayMovie?.title}" removed from your list`);
    }
  };

  // Share handler
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = displayMovie?.title || "Check out this movie";
    const shareText = `Watch "${displayMovie?.title}" on LUO FILM - ${displayMovie?.description?.slice(0, 100)}...`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (error: any) {
        if (error.name !== "AbortError") {
          // Fallback to clipboard
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard!");
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };
  
  // Use Firebase movie data or show not found
  const displayMovie = firebaseMovie ? {
    title: firebaseMovie.title,
    year: firebaseMovie.year || 2024,
    rating: firebaseMovie.rating || 7.5,
    genre: firebaseMovie.genre || [firebaseMovie.category || "Action"],
    duration: firebaseMovie.duration || "2h 0m",
    poster: firebaseMovie.image || firebaseMovie.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
    description: firebaseMovie.description || "No description available.",
  } : null;
  
  // Related movies
  const relatedMovies = allMovies
    .filter((m) => m.firebaseId !== id && m.id !== id)
    .slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!displayMovie) {
    return (
      <div className="min-h-screen bg-background">
        <NavbarCompact />
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-xl font-bold text-foreground mb-4">Movie Not Found</h1>
          <Link to="/" className="text-primary hover:underline">Go back home</Link>
        </div>
        <FooterCompact />
      </div>
    );
  }

  // Subscription gate overlay for video
  const showSubscriptionGate = !canWatch;

  return (
    <div className="min-h-screen bg-background">
      <NavbarCompact />

      <main className="w-full px-4 lg:px-6 xl:px-8 2xl:px-12 py-4">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Home
        </Link>

        {/* Video Player + Episode Selector */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          {/* Video Player */}
          <div className={`relative bg-black rounded-lg overflow-hidden ${isSeries ? 'md:flex-1' : 'w-full'}`}>
            <div className="relative w-full" style={{ paddingBottom: "45%" }}>
              {canWatch ? (
                videoUrl ? (
                  isConfidential ? (
                    <div className="absolute top-0 left-0 w-full h-full">
                      <ArtPlayerVideo
                        url={videoUrl}
                        poster={displayMovie.poster}
                        title={displayMovie.title}
                        className="w-full h-full"
                      />
                    </div>
                  ) : useVideoTag ? (
                    <video
                      src={videoUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      controls
                      autoPlay
                      playsInline
                      title={displayMovie.title}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe
                      src={videoUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={displayMovie.title}
                      style={{ border: "none" }}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                    <div className="text-center">
                      <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No video available</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-secondary to-background">
                  <img
                    src={displayMovie.poster}
                    alt={displayMovie.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
                  />
                  <div className="relative text-center p-6 z-10">
                    {!user ? (
                      <>
                        <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-foreground mb-2">Sign In Required</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Please sign in to watch this content
                        </p>
                        <button
                          onClick={() => setShowLoginModal(true)}
                          className="px-5 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Sign In
                        </button>
                      </>
                    ) : (
                      <>
                        <Crown className="w-12 h-12 text-primary mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-foreground mb-2">Premium Content</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Subscribe to watch unlimited movies and series
                        </p>
                        <button
                          onClick={() => setShowSubscriptionModal(true)}
                          className="px-5 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Subscribe Now
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* HD Badge */}
            <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              HD
            </div>
          </div>

          {/* Episode Selector for Series - below on mobile, side on desktop */}
          {isSeries && (
            <div className="w-full md:w-36 flex-shrink-0">
              <EpisodeSelector
                episodes={episodes}
                currentEpisode={currentEpisode}
                onSelectEpisode={setCurrentEpisode}
              />
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="mb-6">
          {/* Main Info */}
          <div>
            <div className="flex items-start gap-3 mb-3">
              {/* Poster */}
              <div className="w-20 h-28 rounded overflow-hidden flex-shrink-0 hidden sm:block">
                <img
                  src={displayMovie.poster}
                  alt={displayMovie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop";
                  }}
                />
              </div>
              
              {/* Details */}
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground mb-1.5">
                  {displayMovie.title}
                  {isSeries && episodes[currentEpisode] && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      - Ep {episodes[currentEpisode].episodeNumber}: {episodes[currentEpisode].title || ''}
                    </span>
                  )}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                    <span className="text-foreground font-medium">{displayMovie.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{displayMovie.year}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{displayMovie.duration}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {displayMovie.genre.map((g) => (
                    <span
                      key={g}
                      className="px-1.5 py-0.5 bg-secondary text-[10px] text-muted-foreground rounded"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {displayMovie.description}
                </p>
              </div>
            </div>

            {/* Action Buttons - Now Working */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={handleWatchNow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded hover:bg-primary/90 transition-colors"
              >
                <Play className="w-3 h-3" fill="currentColor" />
                Watch Now
              </button>
              <button 
                onClick={handleAddToList}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isInList 
                    ? 'bg-primary text-white' 
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                {isInList ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {isInList ? "In List" : "Add to List"}
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground text-xs font-medium rounded hover:bg-muted transition-colors"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
              <button 
                onClick={handleDownload}
                disabled={isDownloading || !rawStreamlink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Download className={`w-3 h-3 ${isDownloading ? "animate-bounce" : ""}`} />
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>

        </div>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-foreground uppercase mb-3">
              You May Also Like
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
              {relatedMovies.map((m) => (
                <MovieCardCompact key={m.id} movie={m} />
              ))}
            </div>
          </section>
        )}
      </main>

      <FooterCompact />
      <MobileBottomNav />
      
      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
};

export default Watch;
