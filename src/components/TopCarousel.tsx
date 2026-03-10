import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExtendedMovie } from "@/hooks/useMovies";

interface TopCarouselProps {
  movies: ExtendedMovie[];
}

// VJ Badge component
const VJBadge = () => (
  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-gradient-to-r from-primary to-accent text-white text-[8px] font-bold rounded shadow-lg z-10">
    VJ MAKER
  </div>
);

const TopCarousel = ({ movies }: TopCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused || movies.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
        
        if (isAtEnd) {
          // Reset to beginning
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Scroll to next
          scroll("right");
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, movies.length]);


  return (
    <section 
      className="relative py-4 bg-card/50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Title */}
      <div className="container mx-auto px-4 mb-3">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
          🔥 Popular Now
          <span className="text-[10px] font-normal text-muted-foreground">(Auto-playing)</span>
        </h2>
      </div>

      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-background/80 hover:bg-background text-foreground rounded-full transition-colors shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-12"
      >
        {movies.map((movie) => {
          const movieId = movie.firebaseId || movie.id;
          
          return (
            <Link
              key={movie.id}
              to={`/watch/${movieId}`}
              className="flex-shrink-0 w-28 group"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card shadow-md hover:shadow-xl transition-shadow duration-300">
                {/* VJ Badge */}
                <VJBadge />
                
                <img
                  src={movie.image || movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop";
                  }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Play indicator on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[10px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
              <p className="mt-1.5 text-[10px] text-foreground text-center truncate font-medium">
                {movie.title}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-background/80 hover:bg-background text-foreground rounded-full transition-colors shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress indicator dots */}
      <div className="flex justify-center gap-1 mt-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === 0 ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default TopCarousel;
