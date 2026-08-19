import { useState } from "react";
import { Search, Menu, X, LogOut, LogIn, Settings, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import LoginModal from "@/components/LoginModal";
import SubscriptionModal from "@/components/SubscriptionModal";

const NavbarCompact = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, isAdminUser } = useAuth();
  const { isSubscribed, daysRemaining } = useSubscription();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Movies", href: "/movies" },
    { name: "TV Series", href: "/series" },
    { name: "Animation", href: "/animation" },
    { name: "Music", href: "/music" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Get display name from Firebase user
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="w-full px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Left Side - Logo & Search */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="VJ MAKER.SITE" className="h-8 w-8 rounded-full object-cover" />
                <span className="font-display font-bold text-lg text-primary hidden sm:inline">
                  VJ MAKER.SITE
                </span>
              </Link>

              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Center - Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Side - User */}
            <div className="flex items-center gap-2">
              {/* Subscribe Button */}
              {!isSubscribed && (
                <button
                  onClick={() => setSubscriptionModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Subscribe</span>
                </button>
              )}

              

              {user ? (
                <>
                  {/* Admin Dashboard Link */}
                  {isAdminUser && (
                    <Link
                      to="/admin"
                      className="hidden sm:flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Admin
                    </Link>
                  )}

                  {/* User Avatar & Name */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-foreground">
                          {getDisplayName().charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:inline text-sm text-foreground">
                      {getDisplayName()}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <form onSubmit={handleSearch} className="py-2 animate-fade-in">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, shows..."
                className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </form>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-2 border-t border-border animate-fade-in">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {isAdminUser && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-primary hover:bg-secondary rounded transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              {!user && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-primary hover:bg-secondary rounded transition-colors w-full text-left"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      
      {/* Subscription Modal */}
      <SubscriptionModal open={subscriptionModalOpen} onClose={() => setSubscriptionModalOpen(false)} />
    </>
  );
};

export default NavbarCompact;
