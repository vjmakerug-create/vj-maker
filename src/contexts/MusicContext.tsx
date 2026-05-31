import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { getGoogleDriveDownloadUrl, extractGoogleDriveFileId } from "@/lib/firebase";

export interface PlayableTrack {
  id: string;
  title: string;
  artist?: string;
  cover?: string;
  audioUrl: string;
  albumTitle?: string;
}

// Convert Google Drive share links into something <audio> can actually stream
export const resolveAudioUrl = (url: string, fileName?: string): string => {
  if (!url) return "";
  if (extractGoogleDriveFileId(url)) {
    // Stream through the Cloudflare worker so the browser <audio> tag
    // can play the file without Google Drive's CORS/redirect issues.
    return getGoogleDriveDownloadUrl(url, fileName ? `${fileName}.mp3` : "audio.mp3");
  }
  return url;
};

interface MusicContextType {
  current: PlayableTrack | null;
  queue: PlayableTrack[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playTrack: (track: PlayableTrack, queue?: PlayableTrack[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<PlayableTrack | null>(null);
  const [queue, setQueue] = useState<PlayableTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);

  const playTrack = (track: PlayableTrack, newQueue?: PlayableTrack[]) => {
    setCurrent(track);
    if (newQueue) setQueue(newQueue);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }, 100);
  };

  const togglePlay = () => {
    if (!audioRef.current || !current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const next = () => {
    if (!current || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === current.id);
    const nextTrack = queue[idx + 1];
    if (nextTrack) playTrack(nextTrack, queue);
  };

  const prev = () => {
    if (!current || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === current.id);
    const prevTrack = queue[idx - 1];
    if (prevTrack) playTrack(prevTrack, queue);
  };

  const seek = (seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime = seconds;
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => next();

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [current, queue]);

  return (
    <MusicContext.Provider
      value={{
        current,
        queue,
        isPlaying,
        progress,
        duration,
        volume,
        playTrack,
        togglePlay,
        next,
        prev,
        seek,
        setVolume,
        audioRef,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={current ? resolveAudioUrl(current.audioUrl, current.title) : undefined}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </MusicContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicPlayer must be used inside MusicProvider");
  return ctx;
};