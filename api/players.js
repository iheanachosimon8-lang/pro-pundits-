// Vercel serverless endpoint: keeps the API-Football key on the server.
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return res.status(503).json({ error: "Player statistics are not connected yet. Add API_FOOTBALL_KEY in Vercel → Settings → Environment Variables, then redeploy." });
  const category = String(req.query.category || "scorers");
  const endpoints = { scorers:"topscorers", assists:"topassists", yellow:"topyellowcards", red:"topredcards" };
  if (!endpoints[category]) return res.status(400).json({ error: "Unsupported statistics category." });
  const league = String(req.query.league || "39");
  const season = String(req.query.season || "2026");
  if (!/^\d{1,4}$/.test(league) || !/^20\d{2}$/.test(season)) return res.status(400).json({ error: "Invalid league or season." });
  try {
    const url = "https://v3.football.api-sports.io/players/" + endpoints[category] + "?league=" + encodeURIComponent(league) + "&season=" + encodeURIComponent(season);
    const upstream = await fetch(url, { headers: { "x-apisports-key": key } });
    const data = await upstream.json();
    if (!upstream.ok || (data.errors && Object.keys(data.errors).length)) return res.status(502).json({ error: "The statistics provider rejected the request. Check your API key, plan and season." });
    const players = (data.response || []).map(row => {
      const stat = (row.statistics || [])[0] || {};
      const games = stat.games || {}, goals = stat.goals || {}, cards = stat.cards || {};
      let value = 0;
      if (category === "scorers") value = goals.total || 0;
      if (category === "assists") value = goals.assists || 0;
      if (category === "yellow") value = cards.yellow || 0;
      if (category === "red") value = cards.red || 0;
      return { name: row.player && row.player.name, photo: row.player && row.player.photo, team: stat.team && stat.team.name, appearances: games.appearences || 0, value, rating: games.rating ? Number(games.rating).toFixed(2) : "—" };
    });
    players.sort((a,b) => Number(b.value) - Number(a.value));
    return res.status(200).json({ players: players.slice(0,30), category, league, season });
  } catch (error) {
    return res.status(502).json({ error: "Could not reach the football statistics provider. Please try again later." });
  }
};
