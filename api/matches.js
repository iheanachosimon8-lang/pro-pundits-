// Live football fixtures and evidence-led forecasts.
// API-Football key stays server-side. Forecasts are provider estimates, never guarantees.
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return res.status(503).json({ error: "Football data is not connected. Add API_FOOTBALL_KEY in Vercel Environment Variables." });
  const tz = "Africa/Lagos";
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const lagosDate = parts.find(p => p.type === "year").value + "-" + parts.find(p => p.type === "month").value + "-" + parts.find(p => p.type === "day").value;
  const requestedDate = String(req.query.date || "");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : lagosDate;
  const start = new Date(date + "T00:00:00Z");
  if (Number.isNaN(start.getTime())) return res.status(400).json({ error: "Invalid date." });
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + 3);
  const to = end.toISOString().slice(0,10);
  const base = "https://v3.football.api-sports.io";
  const headers = { "x-apisports-key": key };
  async function api(path) {
    const r = await fetch(base + path, { headers });
    const d = await r.json();
    if (!r.ok || (d.errors && Object.keys(d.errors).length)) {
      const details = d.errors && Object.keys(d.errors).length
        ? Object.values(d.errors).map(v => String(v)).join("; ")
        : "HTTP " + r.status;
      console.error("API-Football request failed:", path.split("?")[0], r.status, details);
      throw new Error("Football data provider error (" + r.status + "): " + details.slice(0, 240));
    }
    return d.response || [];
  }
  try {
    // Live scores are served by /api/live. Keep this endpoint focused on the selected date.
    const scheduled = await api("/fixtures?date=" + date + "&timezone=" + encodeURIComponent(tz));
    const fixtures = scheduled.filter(f => f && f.fixture && f.teams)
      .sort((a,b) => new Date(a.fixture.date)-new Date(b.fixture.date));
    const liveStatuses = new Set(["1H","HT","2H","ET","BT","P","LIVE"]);
    const upcoming = fixtures.filter(f => !liveStatuses.has(f.fixture.status.short) && f.fixture.status.short !== "FT").slice(0,3);
    const forecastRows = await Promise.all(upcoming.map(async f => {
      try {
        const p = await api("/predictions?fixture=" + f.fixture.id);
        const item = p[0] || {};
        const pred = item.predictions || {};
        const comparison = item.comparison || {};
        const pct = pred.percent || {};
        const probs = [ {label:"Home win",value:parseFloat(pct.home)||0}, {label:"Draw",value:parseFloat(pct.draw)||0}, {label:"Away win",value:parseFloat(pct.away)||0} ];
        const best = probs.reduce((a,b)=>b.value>a.value?b:a,probs[0]);
        return {
          fixtureId:f.fixture.id,
          home:f.teams.home.name, away:f.teams.away.name,
          league:f.league.name, kickoff:f.fixture.date,
          status:f.fixture.status.short,
          homeForm:comparison.form && comparison.form.home,
          awayForm:comparison.form && comparison.form.away,
          homeAttack:comparison.att && comparison.att.home,
          awayAttack:comparison.att && comparison.att.away,
          homeDefense:comparison.def && comparison.def.home,
          awayDefense:comparison.def && comparison.def.away,
          winner:pred.winner && pred.winner.name || best.label,
          advice:pred.advice || "",
          underOver:pred.under_over || "",
          probabilities:probs,
          confidence:best.value || null,
          goalsHome:pred.goals && pred.goals.home || null,
          goalsAway:pred.goals && pred.goals.away || null,
          source:"API-Football predictions"
        };
      } catch (_) {
        return { fixtureId:f.fixture.id, home:f.teams.home.name, away:f.teams.away.name, league:f.league.name, kickoff:f.fixture.date, status:f.fixture.status.short, unavailable:true };
      }
    }));
    return res.status(200).json({ date, timezone:tz, fixtures:forecastRows, live:[], count:fixtures.length });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Could not load live football data. Try again shortly." });
  }
};
