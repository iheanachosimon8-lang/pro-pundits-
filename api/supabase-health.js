// Checks Supabase configuration from Vercel without exposing credentials to the browser.
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ connected: false, message: "Method not allowed." });
  const projectUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!projectUrl || !anonKey) {
    return res.status(503).json({
      connected: false,
      message: "Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then redeploy."
    });
  }
  try {
    const base = projectUrl.replace(/\/+$/, "");
    const parsed = new URL(base);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".supabase.co")) {
      return res.status(400).json({ connected: false, message: "SUPABASE_URL must be your HTTPS Supabase project URL." });
    }
    const upstream = await fetch(base + "/auth/v1/health", {
      headers: { apikey: anonKey, Authorization: "Bearer " + anonKey }
    });
    if (!upstream.ok) {
      return res.status(502).json({ connected: false, message: "Supabase did not accept the health check. Verify the Project URL and anon key." });
    }
    return res.status(200).json({ connected: true });
  } catch (error) {
    return res.status(502).json({ connected: false, message: "Could not reach Supabase. Check the project URL and try again." });
  }
};
