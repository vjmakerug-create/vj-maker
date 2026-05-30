import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicContext";

const formatTime = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const MusicPlayer = () => {
  const { current, isPlaying, togglePlay, next, prev, progress, duration, seek, volume, setVolume } = useMusicPlayer();

  if (!current) return null;

  return (
    <div className="fixed bottom-20 md:bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="px-3 md:px-6 py-2 flex items-center gap-3">
        {/* Cover + Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-initial md:w-64">
          <img
            src={current.cover || "/placeholder.svg"}
            alt={current.title}
            className="w-10 h-10 md:w-12 md:h-12 rounded object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs md:text-sm font-medium text-foreground truncate">{current.title}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground truncate">
              {current.artist || "Unknown artist"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4" fill="currentColor" />}
            </button>
            <button
              onClick={next}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Next"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2 w-full max-w-md">
            <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-primary"
            />
            <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume (desktop) */}
        <div className="hidden md:flex items-center gap-2 w-32">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 accent-primary"
          />
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="md:hidden h-0.5 bg-secondary">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
        />
      </div>
    </div>
  );
};

export default MusicPlayer;