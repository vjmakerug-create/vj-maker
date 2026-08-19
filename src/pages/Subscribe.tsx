import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film } from "lucide-react";
import NavbarCompact from "@/components/NavbarCompact";

const Subscribe = () => {
  const navigate = useNavigate();

  // Site is now free - redirect to home
  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <NavbarCompact />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Film className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Free Access!</h1>
          <p className="text-muted-foreground mb-4">
            VJ MAKER.SITE is completely free. Enjoy unlimited movies and series!
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Start Watching
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
