import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import NavbarCompact from "@/components/NavbarCompact";
import MovieGrid from "@/components/MovieGrid";
import FooterCompact from "@/components/FooterCompact";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useMovies } from "@/hooks/useMovies";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { movies, loading } = useMovies();
  
  // Filter movies based on search query
  const searchResults = useMemo(() => {
    if (!query) return [];
    const searchLower = query.toLowerCase();
    return movies.filter(
      (m) =>
        m.title.toLowerCase().includes(searchLower) ||
        m.category?.toLowerCase().includes(searchLower) ||
        m.genre?.some((g) => g.toLowerCase().includes(searchLower))
    );
  }, [movies, query]);

  return (
    <div className="min-h-screen bg-background">
      <NavbarCompact />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <SearchIcon className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-bold text-foreground">
            {query ? `Search Results for "${query}"` : "Search Movies & Series"}
          </h1>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : query ? (
          searchResults.length > 0 ? (
            <MovieGrid movies={searchResults} title={`${searchResults.length} Results`} />
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No results found for "{query}"</p>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Enter a search term to find movies and series</p>
          </div>
        )}
      </div>
      <FooterCompact />
      <MobileBottomNav />
    </div>
  );
};

export default Search;
