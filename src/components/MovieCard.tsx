import { Play, Plus, Star } from "lucide-react";
import { Movie } from "@/data/movies";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="movie-card group cursor-pointer flex-shrink-0 w-40 sm:w-48 lg:w-56">
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
          <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
          </button>
          <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
            <Plus className="w-4 h-4" />
            Add to List
          </button>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 rating-badge">
          <Star className="w-3 h-3 fill-current" />
          {movie.rating}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-1">
        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
          <span>{movie.year}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span className="truncate">{movie.genre[0]}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
