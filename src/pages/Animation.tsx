import NavbarCompact from "@/components/NavbarCompact";
import MovieGrid from "@/components/MovieGrid";
import FooterCompact from "@/components/FooterCompact";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useMovies } from "@/hooks/useMovies";

const Animation = () => {
  const { movies, loading } = useMovies();
  
  // Filter animation content
  const animationMovies = movies.filter(
    (m) => m.category?.toLowerCase() === "animation" || m.genre?.includes("Animation")
  );

  return (
    <div className="min-h-screen bg-background">
      <NavbarCompact />
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <MovieGrid movies={animationMovies} title="Animation" />
      )}
      <FooterCompact />
      <MobileBottomNav />
    </div>
  );
};

export default Animation;
