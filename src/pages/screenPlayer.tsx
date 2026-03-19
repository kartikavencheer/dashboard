useEffect(() => {
  const load = async () => {
    const res = await axios.get(`/api/mosaic/live/${eventId}`);
    setTiles(res.data.tiles);
  };

  load();
  setInterval(load, 5000);
}, []);
