// GET /api/feed?user=NAME
// Reads a person's PUBLIC Letterboxd RSS feed (their ~50 most recent diary entries)
// and returns [{ n: title, y: year, r: rating or null }].
module.exports = async (req, res) => {
  const u = String(req.query.user || "");
  if (!/^[A-Za-z0-9_-]{2,30}$/.test(u)) return res.status(400).json({ error: "That doesn’t look like a valid username." });

  let r;
  try {
    r = await fetch(`https://letterboxd.com/${u}/rss/`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Afterglow/1.0)" },
    });
  } catch {
    return res.status(502).json({ error: "Couldn’t reach Letterboxd." });
  }
  if (r.status === 404) return res.status(404).json({ error: "No Letterboxd account found with that username." });
  if (!r.ok) return res.status(502).json({ error: "Letterboxd didn’t allow the lookup." });

  const xml = await r.text();
  const dec = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").trim();
  const tag = (s, t) => { const m = s.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)); return m ? dec(m[1]) : ""; };

  const films = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map((m) => {
      const rating = parseFloat(tag(m[1], "letterboxd:memberRating"));
      return { n: tag(m[1], "letterboxd:filmTitle"), y: tag(m[1], "letterboxd:filmYear"), r: isNaN(rating) ? null : rating };
    })
    .filter((f) => f.n);

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
  res.status(200).json({ user: u, films });
};
