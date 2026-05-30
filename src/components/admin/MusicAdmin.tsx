import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Music as MusicIcon, Disc3, ListMusic } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  subscribeToSongs,
  subscribeToAlbums,
  addSong,
  updateSong,
  deleteSong,
  addAlbum,
  updateAlbum,
  deleteAlbum,
  addTrackToAlbum,
  updateTrack,
  deleteTrack,
  FirebaseSong,
  FirebaseAlbum,
  MusicTrack,
} from "@/lib/firebase";

type SubTab = "songs" | "albums";

const MusicAdmin = () => {
  const [sub, setSub] = useState<SubTab>("songs");
  const [songs, setSongs] = useState<FirebaseSong[]>([]);
  const [albums, setAlbums] = useState<FirebaseAlbum[]>([]);

  const [songModalOpen, setSongModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<FirebaseSong | null>(null);

  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<FirebaseAlbum | null>(null);

  const [tracksAlbum, setTracksAlbum] = useState<FirebaseAlbum | null>(null);

  useEffect(() => {
    const u1 = subscribeToSongs(setSongs);
    const u2 = subscribeToAlbums(setAlbums);
    return () => {
      u1();
      u2();
    };
  }, []);

  // Keep tracksAlbum fresh when albums change
  useEffect(() => {
    if (tracksAlbum) {
      const fresh = albums.find((a) => a.id === tracksAlbum.id);
      if (fresh) setTracksAlbum(fresh);
    }
  }, [albums]); // eslint-disable-line

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSub("songs")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sub === "songs"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <MusicIcon className="w-4 h-4" /> Songs ({songs.length})
          </button>
          <button
            onClick={() => setSub("albums")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sub === "albums"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Disc3 className="w-4 h-4" /> Albums ({albums.length})
          </button>
        </div>
        <button
          onClick={() => {
            if (sub === "songs") {
              setEditingSong(null);
              setSongModalOpen(true);
            } else {
              setEditingAlbum(null);
              setAlbumModalOpen(true);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add {sub === "songs" ? "Song" : "Album"}
        </button>
      </div>

      {sub === "songs" ? (
        <SongsTable
          songs={songs}
          onEdit={(s) => {
            setEditingSong(s);
            setSongModalOpen(true);
          }}
          onDelete={async (id) => {
            await deleteSong(id);
            toast.success("Song deleted");
          }}
        />
      ) : (
        <AlbumsTable
          albums={albums}
          onEdit={(a) => {
            setEditingAlbum(a);
            setAlbumModalOpen(true);
          }}
          onTracks={(a) => setTracksAlbum(a)}
          onDelete={async (id) => {
            await deleteAlbum(id);
            toast.success("Album deleted");
          }}
        />
      )}

      <SongModal
        open={songModalOpen}
        onOpenChange={(o) => {
          setSongModalOpen(o);
          if (!o) setEditingSong(null);
        }}
        initialData={editingSong}
        onSave={async (data) => {
          if (editingSong) {
            await updateSong(editingSong.id, data);
            toast.success("Song updated");
          } else {
            await addSong(data);
            toast.success("Song added");
          }
          setSongModalOpen(false);
          setEditingSong(null);
        }}
      />

      <AlbumModal
        open={albumModalOpen}
        onOpenChange={(o) => {
          setAlbumModalOpen(o);
          if (!o) setEditingAlbum(null);
        }}
        initialData={editingAlbum}
        onSave={async (data) => {
          if (editingAlbum) {
            await updateAlbum(editingAlbum.id, data);
            toast.success("Album updated");
          } else {
            await addAlbum(data);
            toast.success("Album added");
          }
          setAlbumModalOpen(false);
          setEditingAlbum(null);
        }}
      />

      <TracksModal
        album={tracksAlbum}
        onClose={() => setTracksAlbum(null)}
        onAddTrack={async (track) => {
          if (tracksAlbum) {
            await addTrackToAlbum(tracksAlbum.id, track);
            toast.success("Track added");
          }
        }}
        onUpdateTrack={async (i, data) => {
          if (tracksAlbum) {
            await updateTrack(tracksAlbum.id, i, data);
            toast.success("Track updated");
          }
        }}
        onDeleteTrack={async (i) => {
          if (tracksAlbum) {
            await deleteTrack(tracksAlbum.id, i);
            toast.success("Track deleted");
          }
        }}
      />
    </div>
  );
};

/* ===== Tables ===== */

const SongsTable = ({
  songs,
  onEdit,
  onDelete,
}: {
  songs: FirebaseSong[];
  onEdit: (s: FirebaseSong) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/50">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Cover</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Title</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Artist</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Genre</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Year</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {songs.map((s) => (
            <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
              <td className="px-4 py-3">
                <img src={s.cover || "/placeholder.svg"} alt={s.title} className="w-12 h-12 object-cover rounded" />
              </td>
              <td className="px-4 py-3 text-sm text-foreground font-medium">{s.title}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{s.artist || "-"}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{s.genre || "-"}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{s.year || "-"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(s)} className="p-1.5 text-muted-foreground hover:text-foreground">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {songs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                No songs yet. Click "Add Song" to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const AlbumsTable = ({
  albums,
  onEdit,
  onTracks,
  onDelete,
}: {
  albums: FirebaseAlbum[];
  onEdit: (a: FirebaseAlbum) => void;
  onTracks: (a: FirebaseAlbum) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/50">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Cover</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Title</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Artist</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Year</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Tracks</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {albums.map((a) => (
            <tr key={a.id} className="hover:bg-secondary/30 transition-colors">
              <td className="px-4 py-3">
                <img src={a.cover || "/placeholder.svg"} alt={a.title} className="w-12 h-12 object-cover rounded" />
              </td>
              <td className="px-4 py-3 text-sm text-foreground font-medium">{a.title}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{a.artist || "-"}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{a.year || "-"}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{(a.tracks || []).length}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTracks(a)}
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                    title="Manage tracks"
                  >
                    <ListMusic className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(a)} className="p-1.5 text-muted-foreground hover:text-foreground">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(a.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {albums.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                No albums yet. Click "Add Album" to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

/* ===== Modals ===== */

const inputCls =
  "w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

const SongModal = ({
  open,
  onOpenChange,
  initialData,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialData: FirebaseSong | null;
  onSave: (data: Omit<FirebaseSong, "id">) => Promise<void>;
}) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [cover, setCover] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("2024");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(initialData?.title || "");
    setArtist(initialData?.artist || "");
    setAlbum(initialData?.album || "");
    setCover(initialData?.cover || "");
    setAudioUrl(initialData?.audioUrl || "");
    setGenre(initialData?.genre || "");
    setYear(initialData?.year?.toString() || "2024");
  }, [initialData, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title required");
    if (!audioUrl) return toast.error("Audio URL required");
    setLoading(true);
    try {
      await onSave({
        title,
        artist,
        album,
        cover,
        audioUrl,
        genre,
        year: parseInt(year) || undefined,
      });
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Song</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Artist</label>
              <input value={artist} onChange={(e) => setArtist(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Album</label>
              <input value={album} onChange={(e) => setAlbum(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Cover Image URL</label>
            <input value={cover} onChange={(e) => setCover(e.target.value)} className={inputCls} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Audio URL (MP3) *</label>
            <input
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className={inputCls}
              placeholder="https://.../song.mp3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Genre</label>
              <input value={genre} onChange={(e) => setGenre(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AlbumModal = ({
  open,
  onOpenChange,
  initialData,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialData: FirebaseAlbum | null;
  onSave: (data: Omit<FirebaseAlbum, "id">) => Promise<void>;
}) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [cover, setCover] = useState("");
  const [year, setYear] = useState("2024");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(initialData?.title || "");
    setArtist(initialData?.artist || "");
    setCover(initialData?.cover || "");
    setYear(initialData?.year?.toString() || "2024");
    setGenre(initialData?.genre || "");
    setDescription(initialData?.description || "");
  }, [initialData, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title required");
    setLoading(true);
    try {
      await onSave({
        title,
        artist,
        cover,
        year: parseInt(year) || undefined,
        genre,
        description,
        tracks: initialData?.tracks || [],
      });
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Album</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Artist</label>
              <input value={artist} onChange={(e) => setArtist(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Cover Image URL</label>
            <input value={cover} onChange={(e) => setCover(e.target.value)} className={inputCls} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Genre</label>
            <input value={genre} onChange={(e) => setGenre(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TracksModal = ({
  album,
  onClose,
  onAddTrack,
  onUpdateTrack,
  onDeleteTrack,
}: {
  album: FirebaseAlbum | null;
  onClose: () => void;
  onAddTrack: (t: MusicTrack) => Promise<void>;
  onUpdateTrack: (i: number, data: Partial<MusicTrack>) => Promise<void>;
  onDeleteTrack: (i: number) => Promise<void>;
}) => {
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState("");
  const tracks = album?.tracks || [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !audioUrl) return toast.error("Title and audio URL required");
    await onAddTrack({
      trackNumber: tracks.length + 1,
      title,
      audioUrl,
      duration: duration || undefined,
    });
    setTitle("");
    setAudioUrl("");
    setDuration("");
  };

  return (
    <Dialog open={!!album} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tracks — {album?.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mb-4">
          {tracks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No tracks yet.</p>
          )}
          {tracks.map((t, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
              <span className="text-xs text-muted-foreground w-6 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">{t.title}</div>
                <div className="text-xs text-muted-foreground truncate">{t.audioUrl}</div>
              </div>
              {t.duration && <span className="text-xs text-muted-foreground">{t.duration}</span>}
              <button
                onClick={async () => {
                  const newTitle = window.prompt("New title", t.title);
                  if (newTitle) await onUpdateTrack(i, { title: newTitle });
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteTrack(i)}
                className="p-1.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3 border-t border-border pt-4">
          <div className="text-sm font-medium text-foreground">Add Track</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Track title"
            className={inputCls}
          />
          <input
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="Audio URL (MP3)"
            className={inputCls}
          />
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (e.g. 3:45) — optional"
            className={inputCls}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Track
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MusicAdmin;