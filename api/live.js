// Live scores and key match signals. Provider key stays server-side.
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=180");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return res.status(503).json({ error: "Football data is not connected. Check API_FOOTBALL_KEY in Vercel." });
  const base = "https://v3.football.api-sports.io";
  const headers = { "x-apisports-key": key };
  async function get(path) {
    const r = await fetch(base + path, { headers });
    const d = await r.json();
    if (!r.ok || (d.errors && Object.keys(d.errors).length)) throw new Error("Football provider rejected the live-score request.");
    return d.response || [];
  }
  try {
    const fixtures = await get("/fixtures?live=all&timezone=Africa%2FLagos");
    // Fetch event timelines for at most 3 live fixtures to keep API usage controlled.
    const live = await Promise.all(fixtures.map(async (f, index) => {
      let signals = [];
      if (index < 3 && f.fixture && f.fixture.id) {
        try {
          const events = await get("/fixtures/events?fixture=" + f.fixture.id);
          signals = events.filter(e => {
            const type = String(e.type || "").toLowerCase();
            const detail = String(e.detail || "").toLowerCase();
            return type === "goal" || detail.includes("penalty");
          }).map(e => ({
            minute: e.time && e.time.elapsed,
            extra: e.time && e.time.extra,
            team: e.team && e.team.name,
            player: e.player && e.player.name,
            type: e.type,
            detail: e.detail,
            signal: String(e.detail || "").toLowerCase().includes("penalty") ? "penalty" : "goal"
          })).slice(-8);
        } catch (_) { signals = []; }
      }
      return {
        fixtureId: f.fixture && f.fixture.id,
        home: f.teams && f.teams.home && f.teams.home.name,
        away: f.teams && f.teams.away && f.teams.away.name,
        league: f.league && f.league.name,
        status: f.fixture && f.fixture.status && f.fixture.status.short,
        elapsed: f.fixture && f.fixture.status && f.fixture.status.elapsed,
        homeScore: f.goals && f.goals.home,
        awayScore: f.goals && f.goals.away,
        signals
      };
    }));
    return res.status(200).json({ live, updatedAt: new Date().toISOString(), timezone: "Africa/Lagos" });
  } catch (error) {
    return res.status(502).json({ error: error.message || "Unable to retrieve live scores right now." });
  }
};