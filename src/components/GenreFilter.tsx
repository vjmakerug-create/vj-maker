import { useState } from "react";
import { genres } from "@/data/movies";

const GenreFilter = () => {
  const [activeGenre, setActiveGenre] = useState("All");

  return (
    <section className="py-6 border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`flex-shrink-0 ${
                activeGenre === genre ? "category-pill-active" : "category-pill"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GenreFilter;
