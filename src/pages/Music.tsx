import { Link } from "react-router-dom";
import { Play, Music as MusicIcon, Disc3, Download } from "lucide-react";
import NavbarCompact from "@/components/NavbarCompact";
import FooterCompact from "@/components/FooterCompact";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useSongs, useAlbums } from "@/hooks/useMusic";
import { useMusicPlayer, PlayableTrack } from "@/contexts/MusicContext";
import { downloadTrack } from "@/components/MusicPlayer";

const Music = () => {
  const { songs, loading: songsLoading } = useSongs();
  const { albums, loading: albumsLoading } = useAlbums();
  const { playTrack, current, isPlaying } = useMusicPlayer();

  const loading = songsLoading || albumsLoading;

  const songQueue: PlayableTrack[] = songs.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    cover: s.cover,
    audioUrl: s.audioUrl,
    albumTitle: s.album,
  }));

  return (
    <div className="min-h-screen bg-background pb-32">
      <NavbarCompact />

      <main className="w-full px-4 lg:px-6 xl:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <MusicIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Music</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Albums */}
            {albums.length > 0 && (
              <section className="mb-10">
                <h2 className="text-sm font-bold text-foreground uppercase mb-3 flex items-center gap-2">
                  <Disc3 className="w-4 h-4" /> Albums
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {albums.map((album) => (
                    <Link
                      key={album.id}
                      to={`/music/album/${album.id}`}
                      className="group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-secondary mb-2 relative">
                        <img
                          src={album.cover || "/placeholder.svg"}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" fill="white" />
                        </div>
                      </div>
                      <h3 className="text-xs font-medium text-foreground truncate">{album.title}</h3>
                      <p className="text-[10px] text-muted-foreground truncate">{album.artist || "Various"}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Songs */}
            {songs.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-foreground uppercase mb-3 flex items-center gap-2">
                  <MusicIcon className="w-4 h-4" /> Songs
                </h2>
                <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
                  {songs.map((song, i) => {
                    const isCurrent = current?.id === song.id;
                    return (
                      <button
                        key={song.id}
                        onClick={() => playTrack(songQueue[i], songQueue)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <div className="w-10 text-xs text-muted-foreground tabular-nums text-center">
                          {isCurrent && isPlaying ? (
                            <div className="flex items-end justify-center gap-0.5 h-4">
                              <span className="w-0.5 bg-primary animate-pulse h-full" />
                              <span className="w-0.5 bg-primary animate-pulse h-2/3" />
                              <span className="w-0.5 bg-primary animate-pulse h-full" />
                            </div>
                          ) : (
                            i + 1
                          )}
                        </div>
                        <img
                          src={song.cover || "/placeholder.svg"}
                          alt={song.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${isCurrent ? "text-primary" : "text-foreground"}`}>
                            {song.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {song.artist || "Unknown artist"}
                            {song.album ? ` • ${song.album}` : ""}
                          </div>
                        </div>
                        {song.year && (
                          <span className="hidden sm:inline text-xs text-muted-foreground">{song.year}</span>
                        )}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadTrack(song.audioUrl, song.title, song.artist);
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Download"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </span>
                        <Play className="w-4 h-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {songs.length === 0 && albums.length === 0 && (
              <div className="text-center py-20">
                <MusicIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No music available yet. Check back soon!</p>
              </div>
            )}
          </>
        )}
      </main>

      <FooterCompact />
      <MobileBottomNav />
    </div>
  );
};

export default Music;