import { Play, Plus, Info, Star } from "lucide-react";
import { featuredMovie } from "@/data/movies";
import heroBackdrop from "@/assets/hero-backdrop.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-end pb-20 lg:pb-32">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBackdrop}
          alt={featuredMovie.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 gradient-overlay" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="max-w-2xl animate-slide-up">
          {/* Badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="category-pill-active">Featured</span>
            <div className="flex items-center gap-1 text-movie-gold">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold">{featuredMovie.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
            {featuredMovie.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-6">
            <span>{featuredMovie.year}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{featuredMovie.duration}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            {featuredMovie.genre.map((g, i) => (
              <span key={g}>
                {g}
                {i < featuredMovie.genre.length - 1 && ", "}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-lg mb-8 line-clamp-3">
            {featuredMovie.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary flex items-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add to List
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Info className="w-5 h-5" />
              More Info
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;