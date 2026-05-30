import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Disc3 } from "lucide-react";
import NavbarCompact from "@/components/NavbarCompact";
import FooterCompact from "@/components/FooterCompact";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAlbum } from "@/hooks/useMusic";
import { useMusicPlayer, PlayableTrack } from "@/contexts/MusicContext";

const Album = () => {
  const { id } = useParams();
  const { album, loading } = useAlbum(id || "");
  const { playTrack, current, isPlaying } = useMusicPlayer();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-background">
        <NavbarCompact />
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-xl font-bold text-foreground mb-4">Album Not Found</h1>
          <Link to="/music" className="text-primary hover:underline">Back to Music</Link>
        </div>
        <FooterCompact />
      </div>
    );
  }

  const tracks = album.tracks || [];
  const queue: PlayableTrack[] = tracks.map((t, i) => ({
    id: `${album.id}-${i}`,
    title: t.title,
    artist: album.artist,
    cover: album.cover,
    audioUrl: t.audioUrl,
    albumTitle: album.title,
  }));

  const playAll = () => {
    if (queue.length > 0) playTrack(queue[0], queue);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <NavbarCompact />

      <main className="w-full px-4 lg:px-6 xl:px-8 py-6">
        <Link
          to="/music"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Music
        </Link>

        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <img
            src={album.cover || "/placeholder.svg"}
            alt={album.title}
            className="w-48 h-48 rounded-lg object-cover shadow-xl"
          />
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Disc3 className="w-3 h-3" /> ALBUM
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{album.title}</h1>
            <p className="text-sm text-muted-foreground mb-1">{album.artist || "Various Artists"}</p>
            <p className="text-xs text-muted-foreground mb-4">
              {album.year ? `${album.year} • ` : ""}{tracks.length} track{tracks.length === 1 ? "" : "s"}
            </p>
            {album.description && (
              <p className="text-sm text-muted-foreground mb-4 max-w-xl">{album.description}</p>
            )}
            <div>
              <button
                onClick={playAll}
                disabled={tracks.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Play
              </button>
            </div>
          </div>
        </div>

        {tracks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No tracks in this album yet.</p>
        ) : (
          <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
            {tracks.map((track, i) => {
              const isCurrent = current?.id === queue[i].id;
              return (
                <button
                  key={i}
                  onClick={() => playTrack(queue[i], queue)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="w-8 text-xs text-muted-foreground tabular-nums text-center">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-end justify-center gap-0.5 h-4">
                        <span className="w-0.5 bg-primary animate-pulse h-full" />
                        <span className="w-0.5 bg-primary animate-pulse h-2/3" />
                        <span className="w-0.5 bg-primary animate-pulse h-full" />
                      </div>
                    ) : (
                      track.trackNumber || i + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isCurrent ? "text-primary" : "text-foreground"}`}>
                      {track.title}
                    </div>
                  </div>
                  {track.duration && (
                    <span className="text-xs text-muted-foreground tabular-nums">{track.duration}</span>
                  )}
                  <Play className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </main>

      <FooterCompact />
      <MobileBottomNav />
    </div>
  );
};

export default Album;