import { useState } from "react";
import MovieCardCompact from "./MovieCardCompact";
import { ExtendedMovie } from "@/hooks/useMovies";
import { List, LayoutGrid } from "lucide-react";

interface MovieGridProps {
  movies: ExtendedMovie[];
  title: string;
}

const ITEMS_PER_PAGE = 24;

const MovieGrid = ({ movies, title }: MovieGridProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const tabs = [
    { id: "all", label: "ALL" },
    { id: "movies", label: "MOVIES" },
    { id: "series", label: "TV SERIES" },
    { id: "animation", label: "ANIMATION" },
    { id: "trending", label: "TRENDING" },
  ];

  // Filter movies based on tab
  const filteredMovies = movies.filter((movie) => {
    if (activeTab === "all") return true;
    if (activeTab === "movies") return movie.type === "movie";
    if (activeTab === "series") return movie.type === "series";
    if (activeTab === "animation") return movie.category?.toLowerCase() === "animation" || movie.genre?.includes("Animation");
    if (activeTab === "trending") return movie.isTrending;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
      pages.push(i);
    }
    
    if (totalPages > maxVisiblePages) {
      pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-1 mt-8">
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && setCurrentPage(page)}
            disabled={page === "..."}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${
              currentPage === page
                ? "bg-primary text-white"
                : page === "..."
                ? "text-muted-foreground cursor-default"
                : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded flex items-center justify-center text-sm bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <section className="py-6">
      <div className="w-full px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "list" ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "grid" ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-border mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "text-foreground border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 3xl:grid-cols-14 4xl:grid-cols-16 gap-3">
          {paginatedMovies.map((movie) => (
            <MovieCardCompact key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}
      </div>
    </section>
  );
};

export default MovieGrid;
