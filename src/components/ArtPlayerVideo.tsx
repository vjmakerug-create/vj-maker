import { useEffect, useRef } from "react";
import Artplayer from "artplayer";

interface ArtPlayerVideoProps {
  url: string;
  poster?: string;
  title?: string;
  className?: string;
}

const ArtPlayerVideo = ({ url, poster, title, className }: ArtPlayerVideoProps) => {
  const artRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Artplayer | null>(null);

  useEffect(() => {
    if (!artRef.current || !url) return;

    // Destroy previous instance
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    playerRef.current = new Artplayer({
      container: artRef.current,
      url: url,
      poster: poster || "",
      volume: 0.5,
      isLive: false,
      muted: false,
      autoplay: true,
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: "#e50914",
      lang: navigator.language.toLowerCase(),
      // Fast loading optimizations
      fastForward: true,
      moreVideoAttr: {
        crossOrigin: "anonymous",
        preload: "auto",
      },
      quality: [
        {
          default: true,
          html: "HD 1080P",
          url: url,
        },
        {
          html: "SD 720P",
          url: url,
        },
      ],
      controls: [
        {
          position: "right",
          html: "VJ CONFIDENTIAL",
          index: 1,
          tooltip: "Premium Content",
          style: {
            color: "#10b981",
            fontWeight: "bold",
            fontSize: "12px",
          },
        },
      ],
      icons: {
        state: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>',
      },
    });

    // Force immediate play when ready
    playerRef.current.on('ready', () => {
      playerRef.current?.play();
    });

    // Handle video loaded - start playing immediately
    playerRef.current.on('video:loadedmetadata', () => {
      playerRef.current?.play();
    });

    // Start loading immediately
    playerRef.current.on('video:canplay', () => {
      playerRef.current?.play();
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [url, poster, title]);

  return (
    <div 
      ref={artRef} 
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default ArtPlayerVideo;
