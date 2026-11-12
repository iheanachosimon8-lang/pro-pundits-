// Lightweight live-score endpoint. Keep the provider key on the server.
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=45, stale-while-revalidate=15");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return res.status(503).json({ error: "Football data is not connected. Check API_FOOTBALL_KEY in Vercel." });
  try {
    const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all&timezone=Africa%2FLagos", {
      headers: { "x-apisports-key": key }
    });
    const payload = await response.json();
    if (!response.ok || (payload.errors && Object.keys(payload.errors).length)) {
      return res.status(502).json({ error: "Football provider rejected the live-score request. Check your API key, plan and quota.", providerStatus: response.status });
    }
    const live = (payload.response || []).map(f => ({
      fixtureId: f.fixture && f.fixture.id,
      home: f.teams && f.teams.home && f.teams.home.name,
      away: f.teams && f.teams.away && f.teams.away.name,
      league: f.league && f.league.name,
      status: f.fixture && f.fixture.status && f.fixture.status.short,
      elapsed: f.fixture && f.fixture.status && f.fixture.status.elapsed,
      homeScore: f.goals && f.goals.home,
      awayScore: f.goals && f.goals.away
    }));
    return res.status(200).json({ live, updatedAt: new Date().toISOString(), timezone: "Africa/Lagos" });
  } catch (error) {
    return res.status(502).json({ error: "Unable to retrieve live scores right now." });
  }
};