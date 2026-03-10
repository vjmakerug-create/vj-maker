import { useState, useEffect } from "react";
import { fetchMovies, fetchMovie, subscribeToMovies, FirebaseMovie, Episode } from "@/lib/firebase";

// Extended Movie type for UI compatibility
export interface ExtendedMovie {
  id: string;
  firebaseId?: string;
  title: string;
  year: number;
  rating: number;
  image: string;
  category: string;
  streamlink: string;
  isTrending?: boolean;
  isPopular?: boolean;
  type: "movie" | "series";
  episodes?: Episode[];
  source?: "primary" | "secondary" | "adamson" | "dimpoz" | "confidential";
  // Legacy compatibility
  genre?: string[];
  poster?: string;
  duration?: string;
  backdrop?: string;
  description?: string;
}

// Convert FirebaseMovie to ExtendedMovie format
const convertToExtended = (movie: FirebaseMovie): ExtendedMovie => ({
  id: movie.id,
  firebaseId: movie.id,
  title: movie.title,
  year: movie.year || 2024,
  rating: movie.rating || 7.5,
  image: movie.image || "",
  category: movie.category || "Action",
  streamlink: movie.streamlink || "",
  isTrending: movie.isTrending,
  isPopular: movie.isPopular,
  type: movie.type,
  episodes: movie.episodes,
  source: movie.source,
  // Legacy compatibility mappings
  genre: movie.category ? [movie.category] : ["Action"],
  poster: movie.image,
  duration: "2h 0m",
  backdrop: movie.image,
  description: movie.description || "",
});

export const useMovies = () => {
  const [movies, setMovies] = useState<ExtendedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Use real-time subscription for instant updates
    const unsubscribe = subscribeToMovies((data) => {
      if (!isMounted) return;
      console.log("Real-time update - Content count:", data.length);
      setMovies(data.map(convertToExtended));
      setLoading(false);
    });

    // Fallback: if no data after 5 seconds, try one-time fetch
    const timeout = setTimeout(async () => {
      if (isMounted && loading && movies.length === 0) {
        console.log("Real-time subscription timeout - trying direct fetch...");
        try {
          const data = await fetchMovies();
          if (isMounted && data.length > 0) {
            console.log("Direct fetch succeeded:", data.length, "items");
            setMovies(data.map(convertToExtended));
          } else {
            console.log("Direct fetch returned no data");
            setError("No content available");
          }
        } catch (err) {
          console.error("Direct fetch failed:", err);
          setError("Failed to load content");
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    }, 5000);

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  // Filtered helpers - trending movies are already sorted first by Firebase
  const trendingMovies = movies.filter(m => m.isTrending);
  const seriesOnly = movies.filter(m => m.type === "series");
  const moviesOnly = movies.filter(m => m.type === "movie");

  return { movies, trendingMovies, seriesOnly, moviesOnly, loading, error };
};

export const useMovie = (id: string) => {
  const [movie, setMovie] = useState<ExtendedMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Also subscribe to all movies to find the movie in cache first
  const { movies, loading: moviesLoading } = useMovies();

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        
        // First, check if the movie is already in the movies list (from real-time subscription)
        const cachedMovie = movies.find(m => m.id === id || m.firebaseId === id);
        if (cachedMovie) {
          console.log("Found movie in cache:", cachedMovie.title, "Source:", cachedMovie.source);
          setMovie(cachedMovie);
          setLoading(false);
          return;
        }
        
        // If not in cache and movies are still loading, wait
        if (moviesLoading) {
          return;
        }
        
        // If movies loaded but not found in cache, try direct fetch as fallback
        const data = await fetchMovie(id);
        
        if (data) {
          console.log("Loaded movie from DB:", data.title, "streamlink:", data.streamlink);
          setMovie(convertToExtended(data));
        } else {
          setError("Movie not found");
        }
      } catch (err) {
        console.error("Failed to load movie:", err);
        // If direct fetch fails, the movie might still be in the subscription cache
        const cachedMovie = movies.find(m => m.id === id || m.firebaseId === id);
        if (cachedMovie) {
          console.log("Recovered from cache after fetch error:", cachedMovie.title);
          setMovie(cachedMovie);
        } else {
          setError("Failed to load movie");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMovie();
    }
  }, [id, movies, moviesLoading]);

  return { movie, loading: loading || moviesLoading, error };
};
