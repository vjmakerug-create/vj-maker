import { useEffect, useState } from "react";
import { subscribeToSongs, subscribeToAlbums, FirebaseSong, FirebaseAlbum } from "@/lib/firebase";

export const useSongs = () => {
  const [songs, setSongs] = useState<FirebaseSong[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = subscribeToSongs((data) => {
      setSongs(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  return { songs, loading };
};

export const useAlbums = () => {
  const [albums, setAlbums] = useState<FirebaseAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = subscribeToAlbums((data) => {
      setAlbums(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  return { albums, loading };
};

export const useAlbum = (id: string) => {
  const { albums, loading } = useAlbums();
  const album = albums.find((a) => a.id === id) || null;
  return { album, loading };
};