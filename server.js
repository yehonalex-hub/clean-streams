const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const express = require("express");
const zlib = require("zlib");

const CONFIG = {
  PORT: process.env.PORT || 7000,
  UPSTREAM_URL: "https://torrentio.strem.fun",
  BASE_URL: process.env.RENDER_EXTERNAL_URL || "https://clean-streams.onrender.com",
};

// רשימת סדרות ישראליות בשמות עבריים
const ISRAELI_SERIES = [
  {
    id: "tt8796226",
    type: "series",
    name: "קופה ראשית",
    poster: "https://images.metahub.space/poster/medium/tt8796226/img",
    description: "קומדיית המצבים האהובה של כאן 11 בסניף 'שפע יששכר' ביבנה.",
    releaseInfo: "2018",
    isKan11: true,
    hebrewQuery: "קופה ראשית"
  },
  {
    id: "tt12819234",
    type: "series",
    name: "מנאייכ",
    poster: "https://images.metahub.space/poster/medium/tt12819234/img",
    description: "דרמת פשע ומתח ישראלית על חוקר מח\"ש איזי בכר.",
    releaseInfo: "2020",
    isKan11: true,
    hebrewQuery: "מנאייכ"
  },
  {
    id: "tt4565380",
    type: "series",
    name: "פאודה",
    poster: "https://images.metahub.space/poster/medium/tt4565380/img",
    description: "סדרת האקשן והמתח המצליחה על יחידת המסתערבים.",
    releaseInfo: "2015"
  },
  {
    id: "tt10577736",
    type: "series",
    name: "טהרן",
    poster: "https://images.metahub.space/poster/medium/tt10577736/img",
    description: "סדרת הריגול הבינלאומית על סוכנת מוסד הנשלחת לטהרן.",
    releaseInfo: "2020",
    isKan11: true,
    hebrewQuery: "טהרן"
  },
  {
    id: "tt7865452",
    type: "series",
    name: "שבאבניקים",
    poster: "https://images.metahub.space/poster/medium/tt7865452/img",
    description: "ארבעה תלמידי ישיבה אורתודוקסים מתמודדים עם החיים בירושלים.",
    releaseInfo: "2017"
  },
  {
    id: "tt3069894",
    type: "series",
    name: "שטיסל",
    poster: "https://images.metahub.space/poster/medium/tt3069894/img",
    description: "סיפורה של משפחה חרדית המתגוררת בשכונת גאולה בירושלים.",
    releaseInfo: "2013"
  },
  {
    id: "tt4177454",
    type: "series",
    name: "היהודים באים",
    poster: "https://images.metahub.space/poster/medium/tt4177454/img",
    description: "תוכנית סאטירה ומערכונים ישראלית הבוחנת את תולדות העם היהודי.",
    releaseInfo: "2014",
    isKan11: true,
    hebrewQuery: "היהודים באים"
  },
  {
    id: "tt14426644",
    type: "series",
    name: "המפקדת",
    poster: "https://images.metahub.space/poster/medium/tt14426644/img",
    description: "דרמה קומית על קצינה צעירה בבסיס טירונים של מחו\"ה אלון.",
    releaseInfo: "2021",
    isKan11: true,
    hebrewQuery: "המפקדת"
  },
  {
    id: "tt8190688",
    type: "series",
    name: "שעת נעילה",
    poster: "https://images.metahub.space/poster/medium/tt8190688/img",
    description: "סדרת דרמה היסטורית המתארת את ימי מלחמת יום הכיפורים.",
    releaseInfo: "2020",
    isKan11: true,
    hebrewQuery: "שעת נעילה"
  },
  {
    id: "tt1664065",
    type: "series",
    name: "עספור",
    poster: "https://images.metahub.space/poster/medium/tt1664065/img",
    description: "סדרת דרמת פשע ישראלית על ארבעה חברים המתגוררים בחוות שלדים בירושלים.",
    releaseInfo: "2010"
  },
  {
    id: "tt1405737",
    type: "series",
    name: "רמזור",
    poster: "https://images.metahub.space/poster/medium/tt1405737/img",
    description: "קומדיית המצבים של אדיר מילר על שלושה חברים בשלבים שונים בזוגיות.",
    releaseInfo: "2008"
  },
  {
    id: "tt3657702",
    type: "series",
    name: "זגורי אימפריה",
    poster: "https://images.metahub.space/poster/medium/tt3657702/img",
    description: "משפחת זגורי מבאר שבע מנסה להסיר קללה שהוטלה על המשפחה.",
    releaseInfo: "2014"
  },
  {
    id: "tt0928368",
    type: "series",
    name: "הפיג'מות",
    poster: "https://images.metahub.space/poster/medium/tt0928368/img",
    description: "להקת רוק צעירה מנתניה מנסה לפרוץ בעיר הגדולה תל אביב.",
    releaseInfo: "2003"
  }
];

// רשימת סרטים ישראליים מובילים בשמות עבריים
const ISRAELI_MOVIES = [
  {
    id: "tt43612870",
    type: "movie",
    name: "קופה ראשית: הסרט",
    poster: "https://images.metahub.space/poster/medium/tt43612870/img",
    description: "עובדי סניף 'שפע יששכר' יוצאים להרפתקה מטורפת מחוץ ליבנה בעקבות תקרית מסתורית עם אמנון טיטינסקי.",
    releaseInfo: "2026"
  },
  {
    id: "tt0374053",
    type: "movie",
    name: "מבצע סבתא",
    poster: "https://images.metahub.space/poster/medium/tt0374053/img",
    description: "קומדיית הפולחן הישראלית על שלושה אחים המנסים לקבור את סבתם בקיבוץ.",
    releaseInfo: "1999"
  },
  {
    id: "tt0073052",
    type: "movie",
    name: "גבעת חלפון אינה עונה",
    poster: "https://images.metahub.space/poster/medium/tt0073052/img",
    description: "קומדיית הקאלט הבלתי נשכחת של הגשש החיוור בסיני בבימויו של אסי דיין.",
    releaseInfo: "1976"
  },
  {
    id: "tt3576084",
    type: "movie",
    name: "אפס ביחסי אנוש",
    poster: "https://images.metahub.space/poster/medium/tt3576084/img",
    description: "קומדיה שחורה על משרד שלישות בבסיס צבאי בדרום.",
    releaseInfo: "2014"
  },
  {
    id: "tt7252000",
    type: "movie",
    name: "מכתוב",
    poster: "https://images.metahub.space/poster/medium/tt7252000/img",
    description: "סטיב וצ'ומה, שני גובי עולם תחתון ירושלמים, מחליטים להגשים פתקים מהכותל.",
    releaseInfo: "2017"
  },
  {
    id: "tt0079118",
    type: "movie",
    name: "אסקימו לימון",
    poster: "https://images.metahub.space/poster/medium/tt0079118/img",
    description: "סרט הנעורים הישראלי המצליח ביותר בכל הזמנים של בנצי, מומו ויהודה'לה.",
    releaseInfo: "1978"
  },
  {
    id: "tt12839480",
    type: "movie",
    name: "לשחרר את שולי",
    poster: "https://images.metahub.space/poster/medium/tt12839480/img",
    description: "שלישיית מה קשור יוצאת להרפתקה מטורפת בקולומביה כדי להציל את שולי.",
    releaseInfo: "2021"
  },
  {
    id: "tt1675197",
    type: "movie",
    name: "זוהי סדום",
    poster: "https://images.metahub.space/poster/medium/tt1675197/img",
    description: "כוכבי ארץ נהדרת בקומדיה קורעת על השבוע האחרון בתולדות העיר סדום.",
    releaseInfo: "2010"
  },
  {
    id: "tt0152492",
    type: "movie",
    name: "חגיגה בסנוקר",
    poster: "https://images.metahub.space/poster/medium/tt0152492/img",
    description: "יהודה ברקן וזאב רווח בקלאסיקת הבורקס הנצחית של חנצ'ה וגבריאל.",
    releaseInfo: "1975"
  },
  {
    id: "tt0133689",
    type: "movie",
    name: "צ'רלי וחצי",
    poster: "https://images.metahub.space/poster/medium/tt0133689/img",
    description: "צ'רלי ומיקו, שני נוכלים חביבים, מנסים להסתדר בעולם הגדול.",
    releaseInfo: "1974"
  },
  {
    id: "tt1185616",
    type: "movie",
    name: "ואלס עם באשיר",
    poster: "https://images.metahub.space/poster/medium/tt1185616/img",
    description: "סרט האנימציה הדוקומנטרי המופתי והמועמד לאוסקר של ארי פולמן על מלחמת לבנון.",
    releaseInfo: "2008"
  },
  {
    id: "tt0374279",
    type: "movie",
    name: "סוף העולם שמאלה",
    poster: "https://images.metahub.space/poster/medium/tt0374279/img",
    description: "עיירת פיתוח בנגב בשנות ה-60 מחברת בין משפחה הודית למשפחה מרוקאית.",
    releaseInfo: "2004"
  },
  {
    id: "tt1077262",
    type: "movie",
    name: "עג'מי",
    poster: "https://images.metahub.space/poster/medium/tt1077262/img",
    description: "דרמת פשע ריאליסטית ומועמדת לאוסקר המתרחשת בשכונת עג'מי ביפו.",
    releaseInfo: "2009"
  },
  {
    id: "tt6896536",
    type: "movie",
    name: "פוקסטרוט",
    poster: "https://images.metahub.space/poster/medium/tt6896536/img",
    description: "זוכה פרס אופיר על הורים המתמודדים עם הבשורה הקשה על נפילת בנם בצבא.",
    releaseInfo: "2017"
  }
];

const manifest = {
  id: "community.cleanstreams.il",
  version: "1.4.0",
  name: "Clean Streams (EN / עברית)",
  description: "סרטים וסדרות באיכות מעולה (1080p / 4K / עברית) ללא עומס וללא דיבובים זרים. כולל סדרות וסרטים ישראליים + כתוביות מובנות בעברית ובאנגלית!",
  resources: ["catalog", "stream", "subtitles"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: [
    {
      type: "series",
      id: "israeli_series",
      name: "סדרות ישראליות 🇮🇱",
      extra: [{ name: "search", isRequired: false }]
    },
    {
      type: "movie",
      id: "israeli_movies",
      name: "סרטים ישראליים 🇮🇱",
      extra: [{ name: "search", isRequired: false }]
    }
  ],
  background: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80",
  logo: "https://cdn-icons-png.flaticon.com/512/3172/3172549.png"
};

const builder = new addonBuilder(manifest);

// 1. קטלוגים
builder.defineCatalogHandler(async ({ type, id, extra }) => {
  let list = [];
  if (type === "series" && id === "israeli_series") {
    list = ISRAELI_SERIES;
  } else if (type === "movie" && id === "israeli_movies") {
    list = ISRAELI_MOVIES;
  }

  if (extra && extra.search) {
    const q = extra.search.toLowerCase();
    list = list.filter(item => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
  }

  return { metas: list };
});

// 2. צפייה ישירה עבור סדרות כאן 11
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
          name: "🇮🇱 [1080p] צפייה ישירה",
          title: `🇮🇱 ${show.name} - עונה ${season} פרק ${episode}\n⚡ מתחיל מיידית (איכות Full HD)`
        };
      }
    }
  } catch (err) {
    console.warn(`[CleanStreams] Direct stream search failed:`, err.message);
  }
  return null;
}

function parseStream(stream, isIsraeliContent = false) {
  const fullText = `${stream.name || ""} ${stream.title || ""} ${stream.behaviorHints?.filename || ""}`;

  const seedMatch = fullText.match(/👤\s*(\d+)/i) || fullText.match(/seeds?[:\s]+(\d+)/i);
  const seeders = seedMatch ? parseInt(seedMatch[1], 10) : 0;

  const sizeMatch = fullText.match(/💾\s*([0-9.]+\s*(?:GB|MB))/i);
  const size = sizeMatch ? sizeMatch[1] : "";

  const isJunk = /\b(cam|hdcam|camrip|telesync|ts|hdts|telecine|tc|screener|scr|dvdscr|r5|workprint|sample)\b/i.test(fullText);
  const isHebrew = isIsraeliContent || /[\u0590-\u05FF]|\b(heb|hebrew|hebsub)\b|🇮🇱/i.test(fullText);

  const hasEngOrHebFlag = /🇬🇧|🇺🇸|🇮🇱/.test(fullText);
  const hasForeignFlag = /🇷🇺|🇮🇹|🇫🇷|🇩🇪|🇪🇸|🇮🇳|🇹🇷|🇵🇱|🇨🇿|🇰🇷|🇯🇵|🇨🇳|🇧🇷|🇳🇱|🇸🇪|🇩🇰|🇬🇷/.test(fullText);
  const foreignFlagOnly = hasForeignFlag && !hasEngOrHebFlag;

  const isForeignDub = /\b(french|vf|vff|vfq|truefrench|german|deutsch|italian|ita|hindi|tamil|telugu|malayalam|kannada|spanish|castellano|latino|espanol|polish|polski|turkish|turk)\b/i.test(fullText);
  const hasCyrillic = /[\u0400-\u04FF]/.test(fullText);

  const isForeignLanguage = !isIsraeliContent && ((foreignFlagOnly || isForeignDub || hasCyrillic) && !isHebrew);

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

function filterAndCurate(streams, isIsraeliContent = false) {
  if (!Array.isArray(streams) || streams.length === 0) return [];

  const parsed = streams.map(s => parseStream(s, isIsraeliContent));
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
      title: `🇮🇱 עברית (מדובב / מקור / תרגום)\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"}`
    });
  }

  if (list1080p.length > 0) {
    const item = list1080p[0];
    selected.push({
      ...item.raw,
      name: `⭐ [1080p] Clean Stream`,
      title: `⭐ מומלץ ביותר (איכות FHD חדה)\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"}`
    });
  }

  if (list4k.length > 0) {
    const item = list4k[0];
    selected.push({
      ...item.raw,
      name: `💎 [4K UHD] Clean Stream`,
      title: `💎 איכות 4K מקסימלית (UHD/HDR)\n👤 ${item.seeders} seeds • 💾 ${item.size || "גודל רגיל"}`
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

// 3. מקורות צפייה (Streams)
builder.defineStreamHandler(async ({ type, id }) => {
  console.log(`[CleanStreams] Request received for: ${type}/${id}`);

  const streams = [];

  // עבור סרטים ישראליים מיוחדים
  if (type === "movie" && id === "tt43612870") {
    streams.push({
      ytId: "O0zp3Bqw0a8",
      name: "🇮🇱 [1080p] קופה ראשית: הסרט",
      title: "🎬 הטריילר הרשמי ב-Full HD\nℹ️ הסרט יצא לאקרנים ומוקרן כעת בבתי הקולנוע!\n✨ ברגע שישוחרר לשידור דיגיטלי, הסרט המלא יופיע כאן אוטומטית."
    });
  }

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

    const imdbId = id.split(":")[0];
    const isIsraeli = ISRAELI_MOVIES.some(m => m.id === imdbId) || ISRAELI_SERIES.some(s => s.id === imdbId);

    if (res.ok) {
      const data = await res.json();
      const torrentStreams = filterAndCurate(data.streams || [], isIsraeli);
      streams.push(...torrentStreams);
    }
  } catch (err) {
    console.warn(`[CleanStreams] Upstream error:`, err.message);
  }

  console.log(`[CleanStreams] Returning ${streams.length} streams for ${id}`);
  return { streams };
});

// 4. מנוע כתוביות אוטומטי בענן בעברית ובאנגלית (Wizdom + OpenSubtitles)
builder.defineSubtitlesHandler(async ({ type, id }) => {
  console.log(`[CleanStreams] Subtitles requested for: ${type}/${id}`);

  const subtitles = [];

  // פנייה במקביל ל-Wizdom (המאגר הישראלי המוביל) ול-OpenSubtitles
  const wizdomPromise = (async () => {
    try {
      const url = `https://4b139a4b7f94-wizdom-stremio-v2.baby-beamup.club/subtitles/${type}/${id}.json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.subtitles)) {
          return data.subtitles
            .filter(s => s.lang === "heb" || s.lang === "he")
            .slice(0, 3)
            .map((s, idx) => ({
              id: `clean_wiz_${idx}_${s.id || idx}`,
              url: s.url,
              lang: "heb",
              format: "srt"
            }));
        }
      }
    } catch (err) {
      console.warn(`[CleanStreams] Wizdom subs error:`, err.message);
    }
    return [];
  })();

  const openSubsPromise = (async () => {
    try {
      const url = `https://opensubtitles-v3.strem.io/subtitles/${type}/${id}.json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.subtitles)) {
          const eng = data.subtitles
            .filter(s => s.lang === "eng" || s.lang === "en")
            .slice(0, 2)
            .map((s, idx) => ({
              id: `clean_eng_${idx}_${s.id || idx}`,
              url: s.url,
              lang: "eng",
              format: "srt"
            }));
          const heb = data.subtitles
            .filter(s => s.lang === "heb" || s.lang === "he")
            .slice(0, 2)
            .map((s, idx) => ({
              id: `clean_os_heb_${idx}_${s.id || idx}`,
              url: s.url,
              lang: "heb",
              format: "srt"
            }));
          return { eng, heb };
        }
      }
    } catch (err) {
      console.warn(`[CleanStreams] OpenSubs error:`, err.message);
    }
    return { eng: [], heb: [] };
  })();

  try {
    const [wizdomSubs, openSubs] = await Promise.all([wizdomPromise, openSubsPromise]);

    // כתוביות בעברית: ראשית מ-Wizdom, ואם לא נמצא אז מ-OpenSubtitles
    if (wizdomSubs.length > 0) {
      subtitles.push(...wizdomSubs);
    } else if (openSubs.heb.length > 0) {
      subtitles.push(...openSubs.heb);
    }

    // כתוביות באנגלית מ-OpenSubtitles
    if (openSubs.eng.length > 0) {
      subtitles.push(...openSubs.eng);
    }
  } catch (err) {
    console.warn(`[CleanStreams] Subtitles combination error:`, err.message);
  }

  console.log(`[CleanStreams] Returning ${subtitles.length} clean subtitles (HE/EN) for ${id}`);
  return { subtitles };
});

// 5. שרת ה-Express המשולב עם פריקת והמרת כתוביות (UTF-8)
const app = express();

// נקודת קצה לפריקת קובץ הכתוביות והמרת קידוד לעברית נקייה ללא ג'יבריש
app.get("/sub/download", async (req, res) => {
  const gzUrl = req.query.url;
  if (!gzUrl) return res.status(400).send("Missing url parameter");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(gzUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TemporaryUserAgent' }
    });
    clearTimeout(timeout);

    if (!response.ok) return res.status(502).send("Failed to fetch subtitle");

    const buf = Buffer.from(await response.arrayBuffer());
    let rawTextBuffer;
    try {
      rawTextBuffer = zlib.gunzipSync(buf);
    } catch (e) {
      rawTextBuffer = buf; // אם זה לא מכווץ ב-gz
    }

    // פענוח קידוד (טיפול בג'יבריש עבור כתוביות ישנות ב-windows-1255)
    let text = rawTextBuffer.toString("utf-8");
    if (!/[\u0590-\u05FF]/.test(text)) {
      try {
        const winDecoder = new TextDecoder("windows-1255");
        const winText = winDecoder.decode(rawTextBuffer);
        if (/[\u0590-\u05FF]/.test(winText)) {
          text = winText;
        }
      } catch (err) {}
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(text);
  } catch (err) {
    console.error("[CleanStreams] Subtitle download error:", err.message);
    res.status(500).send("Error downloading subtitle");
  }
});

// שילוב ממשק התוסף של Stremio
const addonRouter = getRouter(builder.getInterface());
app.use(addonRouter);

app.listen(CONFIG.PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Clean Streams Addon v1.4.0 פועל בהצלחה!`);
  console.log(`🌐 כתובת דף התוסף: ${CONFIG.BASE_URL}`);
  console.log(`🔗 כתובת ה-Manifest: ${CONFIG.BASE_URL}/manifest.json`);
  console.log(`💬 מנוע כתוביות אוטומטי בעברית (Wizdom) ובאנגלית (OpenSubtitles) פעיל!`);
  console.log(`=================================================`);
});
