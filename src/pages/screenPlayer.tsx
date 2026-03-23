import { useEffect, useState } from "react";
import axios from "axios";

export default function ScreenPlayer({ eventId }: { eventId: string }) {
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`/api/mosaic/live/${eventId}`);
      setTiles(res.data.tiles);
    };

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval); // cleanup to avoid memory leak
  }, [eventId]);

  return null; // replace with your JSX
}