import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FooterCompact = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer className="bg-card border-t border-border">
      {/* Info Section */}
      <div className="container mx-auto px-4 py-6">
        <h3 className="text-sm font-bold text-foreground uppercase mb-3">
          VJ MAKER - Your Home for Translated Movies
        </h3>
        <p className={`text-xs text-muted-foreground leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}>
          Stream the latest movies and series with professional VJ translations. Enjoy unlimited entertainment in your favorite language, anytime, anywhere. Subscribe today for premium access to our growing library of blockbusters, action, drama, comedy, and more.
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2 transition-colors"
        >
          {isExpanded ? "Show less" : "Show more"}
          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Bottom Links */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
            <a href="#" className="hover:text-foreground transition-colors">Rules</a>
            <a href="#" className="hover:text-foreground transition-colors">Advertising</a>
            <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">
            © LUO MOVIES.SITE 2024. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterCompact;
