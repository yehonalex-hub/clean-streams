const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const CONFIG = {
  PORT: process.env.PORT || 7000,
  UPSTREAM_URL: "https://torrentio.strem.fun",
  MAX_STREAMS_PER_QUALITY: 1,
};

// רשימת סדרות ישראליות מובילות לקטלוג
const ISRAELI_SERIES = [
  {
    id: "tt8796226",
    type: "series",
    name: "קופה ראשית (Checkout)",
    poster: "https://images.metahub.space/poster/medium/tt8796226/img",
    description: "קומדיית המצבים האהובה של כאן 11 בסניף 'שפע יששכר' ביבנה.",
    releaseInfo: "2018",
    isKan11: true,
    hebrewQuery: "קופה ראשית"
  },
  {
    id: "tt12819234",
    type: "series",
    name: "מנאייכ (Manayek)",
    poster: "https://images.metahub.space/poster/medium/tt12819234/img",
    description: "דרמת פשע ומתח ישראלית על חוקר מח\"ש איזי בכר.",
    releaseInfo: "2020",
    isKan11: true,
    hebrewQuery: "מנאייכ"
  },
  {
    id: "tt4565380",
    type: "series",
    name: "פאודה (Fauda)",
    poster: "https://images.metahub.space/poster/medium/tt4565380/img",
    description: "סדרת האקשן והמתח המצליחה על יחידת המסתערבים.",
    releaseInfo: "2015"
  },
  {
    id: "tt10577736",
    type: "series",
    name: "טהרן (Tehran)",
    poster: "https://images.metahub.space/poster/medium/tt10577736/img",
    description: "סדרת הריגול הבינלאומית על סוכנת מוסד הנשלחת לטהרן.",
    releaseInfo: "2020",
    isKan11: true,
    hebrewQuery: "טהרן"
  },
  {
    id: "tt7865452",
    type: "series",
    name: "שבאבניקים (Shababnikim)",
    poster: "https://images.metahub.space/poster/medium/tt7865452/img",
    description: "ארבעה תלמידי ישיבה אורתודוקסים מתמודדים עם החיים בירושלים.",
    releaseInfo: "2017"
  },
  {
    id: "tt3069894",
    type: "series",
    name: "שטיסל (Shtisel)",
    poster: "https://images.metahub.space/poster/medium/tt3069894/img",
    description: "סיפורה של משפחה חרדית המתגוררת בשכונת גאולה בירושלים.",
    releaseInfo: "2013"
  },
  {
    id: "tt4177454",
    type: "series",
    name: "היהודים באים (The Jews Are Coming)",
    poster: "https://images.metahub.space/poster/medium/tt4177454/img",
    description: "תוכנית סאטירה ומערכונים ישראלית הבוחנת את תולדות העם היהודי.",
    releaseInfo: "2014",
    isKan11: true,
    hebrewQuery: "היהודים באים"
  },
  {
    id: "tt14426644",
    type: "series",
    name: "המפקדת (Dismissed)",
    poster: "https://images.metahub.space/poster/medium/tt14426644/img",
    description: "דרמה קומית על קצינה צעירה בבסיס טירונים של מחו\"ה אלון.",
    releaseInfo: "2021",
    isKan11: true,
    hebrewQuery: "המפקדת"
  },
  {
    id: "tt8190688",
    type: "series",
    name: "שעת נעילה (Valley of Tears)",
    poster: "https://images.metahub.space/poster/medium/tt8190688/img",
    description: "סדרת דרמה היסטורית המתארת את ימי מלחמת יום הכיפורים.",
    releaseInfo: "2020",
    isKan11: true,
    hebrewQuery: "שעת נעילה"
  },
  {
    id: "tt1664065",
    type: "series",
    name: "עספור (Asfur)",
    poster: "https://images.metahub.space/poster/medium/tt1664065/img",
    description: "סדרת דרמת פשע ישראלית על ארבעה חברים המתגוררים בחוות שלדים בירושלים.",
    releaseInfo: "2010"
  },
  {
    id: "tt1405737",
    type: "series",
    name: "רמזור (Ramzor)",
    poster: "https://images.metahub.space/poster/medium/tt1405737/img",
    description: "קומדיית המצבים של אדיר מילר על שלושה חברים בשלבים שונים בזוגיות.",
    releaseInfo: "2008"
  },
  {
    id: "tt3657702",
    type: "series",
    name: "זגורי אימפריה (Zaguri Empire)",
    poster: "https://images.metahub.space/poster/medium/tt3657702/img",
    description: "משפחת זגורי מבאר שבע מנסה להסיר קללה שהוטלה על המשפחה.",
    releaseInfo: "2014"
  },
  {
    id: "tt0928368",
    type: "series",
    name: "הפיג'מות (The Pyjamas)",
    poster: "https://images.metahub.space/poster/medium/tt0928368/img",
    description: "להקת רוק צעירה מנתניה מנסה לפרוץ בעיר הגדולה תל אביב.",
    releaseInfo: "2003"
  }
];

const manifest = {
  id: "community.cleanstreams.il",
  version: "1.1.0",
  name: "Clean Streams (EN / עברית)",
  description: "תוסף צפייה נקי ומסונן: רק איכויות מעולות (1080p / 4K / עברית), ללא עומס, ללא CAM וללא שפות זרות. כולל קטלוג סדרות ישראליות!",
  resources: ["catalog", "stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: [
    {
      type: "series",
      id: "israeli_series",
      name: "סדרות ישראליות 🇮🇱",
      extra: [{ name: "search", isRequired: false }]
    }
  ],
  background: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80",
  logo: "https://cdn-icons-png.flaticon.com/512/3172/3172549.png"
};

const builder = new addonBuilder(manifest);

// מטפל בקטלוג סדרות ישראליות
builder.defineCatalogHandler(async ({ type, id, extra }) => {
  if (type === "series" && id === "israeli_series") {
    let list = ISRAELI_SERIES;
    if (extra && extra.search) {
      const q = extra.search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return { metas: list };
  }
  return { metas: [] };
});

// חיפוש וידאו ישיר עבור סדרות ישראליות (כאן 11 ורשת)
async function getDirectStream(show, season, episode) {
  try {
    const query = `${show.hebrewQuery} עונה ${season} פרק ${episode}`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      const regex = /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})","thumbnail".*?"title":\{"runs":\[\{"text":"(.*?)"\}\]/g;
      let m;
      let bestMatch = null;
      while ((m = regex.exec(html)) !== null) {
        const videoId = m[1];
        const title = m[2];

        if (title.includes(show.hebrewQuery)) {
          if (title.includes(`פרק ${episode}`) || title.includes(`פרק ${parseInt(episode)}`)) {
            bestMatch = { videoId, title };
            break;
          }
          if (!bestMatch) {
            bestMatch = { videoId, title };
          }
        }
      }

      if (bestMatch) {
        return {
          ytId: bestMatch.videoId,
          name: "🇮🇱 כאן 11 (1080p)",
          title: `🇮🇱 ${show.name}\n${bestMatch.title}\n⚡ צפייה ישירה רשמית (מתחיל מיידית ללא המתנה)`
        };
      }
    }
  } catch (err) {
    console.warn(`[CleanStreams] Direct stream search failed:`, err.message);
  }
  return null;
}

function parseStream(stream) {
  const fullText = `${stream.name || ""} ${stream.title || ""} ${stream.behaviorHints?.filename || ""}`;

  const seedMatch = fullText.match(/👤\s*(\d+)/i) || fullText.match(/seeds?[:\s]+(\d+)/i);
  const seeders = seedMatch ? parseInt(seedMatch[1], 10) : 0;

  const sizeMatch = fullText.match(/💾\s*([0-9.]+\s*(?:GB|MB))/i);
  const size = sizeMatch ? sizeMatch[1] : "";

  const isJunk = /\b(cam|hdcam|camrip|telesync|ts|hdts|telecine|tc|screener|scr|dvdscr|r5|workprint|sample)\b/i.test(fullText);
  const isHebrew = /[\u0590-\u05FF]|\b(heb|hebrew|hebsub)\b|🇮🇱/i.test(fullText);

  const hasEngOrHebFlag = /🇬🇧|🇺🇸|🇮🇱/.test(fullText);
  const hasForeignFlag = /🇷🇺|🇮🇹|🇫🇷|🇩🇪|🇪🇸|🇮🇳|🇹🇷|🇵🇱|🇨🇿|🇰🇷|🇯🇵|🇨🇳|🇧🇷|🇳🇱|🇸🇪|🇩🇰|🇬🇷/.test(fullText);
  const foreignFlagOnly = hasForeignFlag && !hasEngOrHebFlag;

  const isForeignDub = /\b(french|vf|vff|vfq|truefrench|german|deutsch|italian|ita|hindi|tamil|telugu|malayalam|kannada|spanish|castellano|latino|espanol|rutracker|polish|polski|turkish|turk)\b/i.test(fullText);
  const hasCyrillic = /[\u0400-\u04FF]/.test(fullText);

  const isForeignLanguage = (foreignFlagOnly || isForeignDub || hasCyrillic) && !isHebrew;

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
  const valid = parsed.filter(p => !p.isJunk && !p.isForeignLanguage && p.seeders > 0);

  const hebrewList = valid.filter(p => p.isHebrew).sort((a, b) => b.seeders - a.seeders);
  const list4k = valid.filter(p => p.resolution === "4K").sort((a, b) => b.seeders - a.seeders);
  const list1080p = valid.filter(p => p.resolution === "1080p").sort((a, b) => b.seeders - a.seeders);
  const list720p = valid.filter(p => p.resolution === "720p").sort((a, b) => b.seeders - a.seeders);

  const selected = [];

  if (hebrewList.length > 0) {
    const item = hebrewList[0];
    selected.push({
      ...item.raw,
      name: `🇮🇱 [${item.resolution}] Clean Stream`,
      title: `🇮🇱 כולל עברית (מדובב / תרגום מובנה)\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"}`
    });
  }

  if (list1080p.length > 0) {
    const item = list1080p[0];
    selected.push({
      ...item.raw,
      name: `⭐ [1080p] Clean Stream`,
      title: `⭐ מומלץ ביותר (איכות FHD חדה)\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"} • אנגלית מקורית`
    });
  }

  if (list4k.length > 0) {
    const item = list4k[0];
    selected.push({
      ...item.raw,
      name: `💎 [4K UHD] Clean Stream`,
      title: `💎 איכות 4K מקסימלית (UHD/HDR)\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"} • אנגלית מקורית`
    });
  }

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

  const streams = [];

  if (type === "series") {
    const parts = id.split(":");
    const imdbId = parts[0];
    const season = parts[1] || "1";
    const episode = parts[2] || "1";

    const show = ISRAELI_SERIES.find(s => s.id === imdbId && s.isKan11);
    if (show) {
      console.log(`[CleanStreams] Fetching direct stream for ${show.name} S${season}E${episode}`);
      const direct = await getDirectStream(show, season, episode);
      if (direct) {
        streams.push(direct);
      }
    }
  }

  try {
    const url = `${CONFIG.UPSTREAM_URL}/stream/${type}/${id}.json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const torrentStreams = filterAndCurate(data.streams || []);
      streams.push(...torrentStreams);
    }
  } catch (err) {
    console.warn(`[CleanStreams] Upstream error:`, err.message);
  }

  console.log(`[CleanStreams] Returning ${streams.length} streams for ${id}`);
  return { streams };
});

serveHTTP(builder.getInterface(), { port: CONFIG.PORT }).then(({ url }) => {
  const manifestUrl = url.endsWith("/manifest.json") ? url : `${url}/manifest.json`;
  const stremioProtocol = `stremio://${manifestUrl.replace(/^https?:\/\//, "")}`;

  console.log(`=================================================`);
  console.log(`🚀 Clean Streams Addon v1.1.0 פועל בהצלחה!`);
  console.log(`🌐 כתובת דף התוסף: ${manifestUrl.replace(/\/manifest\.json$/, "")}`);
  console.log(`🔗 כתובת ה-Manifest להתקנה בסטרימיו:`);
  console.log(`   ${manifestUrl}`);
  console.log(`📲 קישור ישיר להתקנה בלחיצה אחת:`);
  console.log(`   ${stremioProtocol}`);
  console.log(`=================================================`);
});
