const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

// הגדרות ברירת מחדל
const CONFIG = {
  PORT: process.env.PORT || 7000,
  UPSTREAM_URL: "https://torrentio.strem.fun",
  MAX_STREAMS_PER_QUALITY: 1, // כמה תוצאות להציג מכל קטגוריה
};

const manifest = {
  id: "community.cleanstreams.il",
  version: "1.0.0",
  name: "Clean Streams (EN / עברית)",
  description: "תוסף צפייה נקי ומסונן: רק איכויות מעולות (1080p / 4K / עברית), ללא עומס, ללא CAM וללא שפות זרות.",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: [],
  background: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80",
  logo: "https://cdn-icons-png.flaticon.com/512/3172/3172549.png"
};

const builder = new addonBuilder(manifest);

function parseStream(stream) {
  const fullText = `${stream.name || ""} ${stream.title || ""} ${stream.behaviorHints?.filename || ""}`;

  // חילוץ כמות משתפים (Seeders)
  const seedMatch = fullText.match(/👤\s*(\d+)/i) || fullText.match(/seeds?[:\s]+(\d+)/i);
  const seeders = seedMatch ? parseInt(seedMatch[1], 10) : 0;

  // חילוץ גודל קובץ
  const sizeMatch = fullText.match(/💾\s*([0-9.]+\s*(?:GB|MB))/i);
  const size = sizeMatch ? sizeMatch[1] : "";

  // סינון איכויות גרועות וצילום קולנוע (CAM, TS וכו')
  const isJunk = /\b(cam|hdcam|camrip|telesync|ts|hdts|telecine|tc|screener|scr|dvdscr|r5|workprint|sample)\b/i.test(fullText);

  // זיהוי עברית (אודיו או כתוביות מובנות)
  const isHebrew = /[\u0590-\u05FF]|\b(heb|hebrew|hebsub)\b|🇮🇱/i.test(fullText);

  // זיהוי שפות זרות שאינן אנגלית או עברית
  const hasEngOrHebFlag = /🇬🇧|🇺🇸|🇮🇱/.test(fullText);
  const hasForeignFlag = /🇷🇺|🇮🇹|🇫🇷|🇩🇪|🇪🇸|🇮🇳|🇹🇷|🇵🇱|🇨🇿|🇰🇷|🇯🇵|🇨🇳|🇧🇷|🇳🇱|🇸🇪|🇩🇰|🇬🇷/.test(fullText);
  const foreignFlagOnly = hasForeignFlag && !hasEngOrHebFlag;

  const isForeignDub = /\b(french|vf|vff|vfq|truefrench|german|deutsch|italian|ita|hindi|tamil|telugu|malayalam|kannada|spanish|castellano|latino|espanol|rutracker|polish|polski|turkish|turk)\b/i.test(fullText);
  const hasCyrillic = /[\u0400-\u04FF]/.test(fullText);

  const isForeignLanguage = (foreignFlagOnly || isForeignDub || hasCyrillic) && !isHebrew;

  // סיווג רזולוציה
  let resolution = "1080p";
  if (/\b(4k|2160p|uhd)\b/i.test(fullText)) resolution = "4K";
  else if (/\b(1080p|fhd)\b/i.test(fullText)) resolution = "1080p";
  else if (/\b(720p|hd)\b/i.test(fullText)) resolution = "720p";
  else resolution = "SD";

  return {
    raw: stream,
    seeders,
    size,
    resolution,
    isJunk,
    isHebrew,
    isForeignLanguage
  };
}

function filterAndCurate(streams) {
  if (!Array.isArray(streams) || streams.length === 0) return [];

  const parsed = streams.map(parseStream);

  // סינון קבצים פגומים, זבל, שפות זרות או קבצים ללא משתפים
  const valid = parsed.filter(p => !p.isJunk && !p.isForeignLanguage && p.seeders > 0);

  const hebrewList = valid.filter(p => p.isHebrew).sort((a, b) => b.seeders - a.seeders);
  const list4k = valid.filter(p => p.resolution === "4K").sort((a, b) => b.seeders - a.seeders);
  const list1080p = valid.filter(p => p.resolution === "1080p").sort((a, b) => b.seeders - a.seeders);
  const list720p = valid.filter(p => p.resolution === "720p").sort((a, b) => b.seeders - a.seeders);

  const selected = [];

  // 1. עברית (אם קיימת) - מקבלת עדיפות בראש הרשימה
  if (hebrewList.length > 0) {
    const item = hebrewList[0];
    selected.push({
      ...item.raw,
      name: `🇮🇱 [${item.resolution}] Clean Stream`,
      title: `🇮🇱 כולל עברית (מדובב / תרגום מובנה)\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"}`
    });
  }

  // 2. איכות 1080p מומלצת (הבחירה המובילה לרוב הצופים)
  if (list1080p.length > 0) {
    const item = list1080p[0];
    selected.push({
      ...item.raw,
      name: `⭐ [1080p] Clean Stream`,
      title: `⭐ מומלץ ביותר (איכות FHD חדה)\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"} • אנגלית מקורית`
    });
  }

  // 3. איכות 4K (עבור מסכי 4K ומי שרוצה את המקסימום)
  if (list4k.length > 0) {
    const item = list4k[0];
    selected.push({
      ...item.raw,
      name: `💎 [4K UHD] Clean Stream`,
      title: `💎 איכות 4K מקסימלית (UHD/HDR)\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"} • אנגלית מקורית`
    });
  }

  // 4. איכות מהירה וקלה (720p או 1080p חלופי)
  if (list720p.length > 0) {
    const item = list720p[0];
    selected.push({
      ...item.raw,
      name: `⚡ [720p] Clean Stream`,
      title: `⚡ קל ומהיר (טעינה מיידית לחיבור איטי)\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"}`
    });
  } else if (list1080p.length > 1) {
    const item = list1080p[1];
    selected.push({
      ...item.raw,
      name: `⚡ [1080p] Clean Stream (חלופי)`,
      title: `⚡ אפשרות 1080p נוספת\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"}`
    });
  }

  return selected;
}

builder.defineStreamHandler(async ({ type, id }) => {
  console.log(`[CleanStreams] Request received for: ${type}/${id}`);

  try {
    const url = `${CONFIG.UPSTREAM_URL}/stream/${type}/${id}.json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 שניות timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[CleanStreams] Upstream returned status ${res.status}`);
      return { streams: [] };
    }

    const data = await res.json();
    const cleanStreams = filterAndCurate(data.streams || []);

    console.log(`[CleanStreams] ${data.streams?.length || 0} upstream streams -> curated to ${cleanStreams.length} clean streams.`);
    return { streams: cleanStreams };
  } catch (err) {
    console.error(`[CleanStreams] Error fetching streams:`, err.message);
    return { streams: [] };
  }
});

// הפעלת השרת
serveHTTP(builder.getInterface(), { port: CONFIG.PORT }).then(({ url }) => {
  const manifestUrl = url.endsWith("/manifest.json") ? url : `${url}/manifest.json`;
  const stremioProtocol = `stremio://${manifestUrl.replace(/^https?:\/\//, "")}`;

  console.log(`=================================================`);
  console.log(`🚀 Clean Streams Addon פועל בהצלחה!`);
  console.log(`🌐 כתובת דף התוסף: ${manifestUrl.replace(/\/manifest\.json$/, "")}`);
  console.log(`🔗 כתובת ה-Manifest להתקנה בסטרימיו:`);
  console.log(`   ${manifestUrl}`);
  console.log(`📲 קישור ישיר להתקנה בלחיצה אחת:`);
  console.log(`   ${stremioProtocol}`);
  console.log(`=================================================`);
});
