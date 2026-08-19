import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { MusicProvider } from "@/contexts/MusicContext";
import Index from "./pages/Index";
import Watch from "./pages/Watch";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Animation from "./pages/Animation";
import Search from "./pages/Search";
import Subscribe from "./pages/Subscribe";
import Admin from "./pages/Admin";
import Music from "./pages/Music";
import Album from "./pages/Album";
import NotFound from "./pages/NotFound";
import SubscriptionModal from "./components/SubscriptionModal";
import MusicPlayer from "./components/MusicPlayer";

const queryClient = new QueryClient();

// This component MUST be rendered inside SubscriptionProvider
const AppRoutes = () => {
  const { showSubscriptionModal, setShowSubscriptionModal } = useSubscription();

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/animation" element={<Animation />} />
        <Route path="/music" element={<Music />} />
        <Route path="/music/album/:id" element={<Album />} />
        <Route path="/search" element={<Search />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/admin" element={<Admin />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SubscriptionModal open={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
      <MusicPlayer />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <MusicProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </BrowserRouter>
          </MusicProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
