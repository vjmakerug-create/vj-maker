import NavbarCompact from "@/components/NavbarCompact";
import MovieGrid from "@/components/MovieGrid";
import FooterCompact from "@/components/FooterCompact";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useMovies } from "@/hooks/useMovies";

const Series = () => {
  const { seriesOnly, loading } = useMovies();

  return (
    <div className="min-h-screen bg-background">
      <NavbarCompact />
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <MovieGrid movies={seriesOnly} title="TV Series" />
      )}
      <FooterCompact />
      <MobileBottomNav />
    </div>
  );
};

export default Series;
