import NavbarCompact from "@/components/NavbarCompact";
import HeroCarousel from "@/components/HeroCarousel";
import MovieGrid from "@/components/MovieGrid";
import FooterCompact from "@/components/FooterCompact";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useMovies } from "@/hooks/useMovies";

const Index = () => {
  const { movies, loading } = useMovies();
  
  // Get popular movies for hero carousel (isPopular or isTrending)
  const popularMovies = movies.filter(m => m.isTrending || (m as any).isPopular).slice(0, 10);
  
  // Fallback to first 10 if no popular movies are marked
  const heroMovies = popularMovies.length > 0 ? popularMovies : movies.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <NavbarCompact />
      {heroMovies.length > 0 && <HeroCarousel movies={heroMovies} />}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <MovieGrid movies={movies} title="Watch Movies Online" />
      )}
      <FooterCompact />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
