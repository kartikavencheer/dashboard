import { useEffect, useState } from "react";
import axios from "axios";

export default function useLiveSubmissions(eventId?: string) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!eventId) return;

    const fetchData = async () => {
      const res = await axios.get(
        `/api/moderator/events/${eventId}/submissions`,
      );
      setData(res.data.data || []);
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);

    return () => clearInterval(interval);
  }, [eventId]);

  return data;
}
