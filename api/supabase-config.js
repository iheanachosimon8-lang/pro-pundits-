// Returns only the public Supabase project URL and publishable/anon key for browser auth.
// These credentials are designed for client-side use; never use a service-role or secret key here.
module.exports = async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return res.status(503).json({ message: "Supabase public configuration is missing. Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel and redeploy." });
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".supabase.co")) {
      return res.status(400).json({ message: "SUPABASE_URL must be your HTTPS Supabase project URL." });
    }
    return res.status(200).json({ url: url.replace(/\\/+$/, ""), anonKey });
  } catch {
    return res.status(400).json({ message: "SUPABASE_URL is not a valid URL." });
  }
};
