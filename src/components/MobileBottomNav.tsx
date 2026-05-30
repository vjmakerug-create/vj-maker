import { Home, Film, Tv, User, LogIn, Music as MusicIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import LoginModal from "@/components/LoginModal";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to?: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  avatar?: string | null;
  isProfile?: boolean;
}

const NavItem = ({ to, icon, label, isActive, onClick, avatar, isProfile }: NavItemProps) => {
  const content = (
    <div className="flex flex-col items-center gap-1 relative">
      {/* Animated gradient ring */}
      <div className={cn(
        "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
        isActive && "mobile-nav-ring"
      )}>
        {/* Inner circle with icon */}
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
          isActive 
            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30" 
            : "bg-secondary/80 text-muted-foreground"
        )}>
          {isProfile && avatar ? (
            <img 
              src={avatar} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            icon
          )}
        </div>
      </div>
      <span className={cn(
        "text-[10px] font-medium transition-colors duration-300",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="flex-1 py-2 focus:outline-none">
        {content}
      </button>
    );
  }

  return (
    <Link to={to || "/"} className="flex-1 py-2">
      {content}
    </Link>
  );
};

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="h-20 md:hidden" />
      
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Blur backdrop */}
        <div className="absolute inset-0 bg-card/90 backdrop-blur-xl border-t border-border/50" />
        
        {/* Navigation items */}
        <div className="relative flex items-center justify-around px-2 pb-safe">
          <NavItem
            to="/"
            icon={<Home className="w-5 h-5" />}
            label="Home"
            isActive={isActive("/")}
          />
          <NavItem
            to="/movies"
            icon={<Film className="w-5 h-5" />}
            label="Movies"
            isActive={isActive("/movies")}
          />
          <NavItem
            to="/series"
            icon={<Tv className="w-5 h-5" />}
            label="Series"
            isActive={isActive("/series")}
          />
          <NavItem
            to="/music"
            icon={<MusicIcon className="w-5 h-5" />}
            label="Music"
            isActive={isActive("/music")}
          />
          {user ? (
            <NavItem
              to="/profile"
              icon={<User className="w-5 h-5" />}
              label="Profile"
              isActive={isActive("/profile")}
              avatar={user.photoURL}
              isProfile
            />
          ) : (
            <NavItem
              icon={<LogIn className="w-5 h-5" />}
              label="Login"
              isActive={false}
              onClick={() => setLoginModalOpen(true)}
            />
          )}
        </div>
      </nav>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  );
};

export default MobileBottomNav;
