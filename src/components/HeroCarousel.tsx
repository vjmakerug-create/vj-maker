import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { ExtendedMovie } from "@/hooks/useMovies";

interface HeroCarouselProps {
  movies: ExtendedMovie[];
}

const HeroCarousel = ({ movies }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused || movies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, movies.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const movieId = currentMovie.firebaseId || currentMovie.id;

  return (
    <section
      className="relative h-[35vh] sm:h-[40vh] lg:h-[45vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image - No fade/blur */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.image || currentMovie.poster}
          alt={currentMovie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop";
          }}
        />
        {/* Minimal gradient only at bottom for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Content - Positioned at bottom, smaller text */}
      <div className="absolute bottom-2 left-0 right-0 px-4 lg:px-6 z-10">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* VJ Badge */}
            <span className="px-1.5 py-0.5 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold rounded">
              VJ MAKER
            </span>
            
            {/* Title */}
            <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white line-clamp-1">
              {currentMovie.title}
            </h1>

            {/* Rating */}
            <div className="hidden sm:flex items-center gap-1 text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-white text-xs">
                {currentMovie.rating || 7.5}
              </span>
            </div>

            {currentMovie.isTrending && (
              <span className="hidden sm:inline px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">
                🔥
              </span>
            )}
          </div>

          {/* Action Button */}
          <Link
            to={`/watch/${movieId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded hover:bg-primary/90 transition-colors"
          >
            <Play className="w-3 h-3" fill="currentColor" />
            Watch
          </Link>
        </div>
      </div>

      {/* Slide Indicators - Small dots at bottom center */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
        {movies.slice(0, 10).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? "bg-primary w-4"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-2 right-2 z-10 bg-black/40 px-2 py-0.5 rounded text-[10px] text-white">
        {currentIndex + 1}/{movies.length}
      </div>
    </section>
  );
};

export default HeroCarousel;
