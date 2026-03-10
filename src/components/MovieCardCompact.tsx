import { Link } from "react-router-dom";
import { ExtendedMovie } from "@/hooks/useMovies";

interface MovieCardCompactProps {
  movie: ExtendedMovie;
}

const MovieCardCompact = ({ movie }: MovieCardCompactProps) => {
  // Use firebaseId if available, otherwise use id
  const movieId = movie.firebaseId || movie.id;

  return (
    <Link 
      to={`/watch/${movieId}`}
      className="block group cursor-pointer"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] rounded overflow-hidden bg-card">
        <img
          src={movie.image || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop";
          }}
        />
        
        {/* LUO Badge - Top Left */}
        <div className="absolute top-1.5 left-1.5 bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          LUO
        </div>
        
        {/* VJ MAKER Badge - Top Right */}
        <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-primary to-accent text-white text-[8px] font-bold px-1 py-0.5 rounded">
          VJ MAKER
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-2 text-xs text-foreground font-medium line-clamp-2 group-hover:text-primary transition-colors">
        {movie.title}
      </h3>
    </Link>
  );
};

export default MovieCardCompact;
