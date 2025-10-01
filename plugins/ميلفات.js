import axios from "axios";
import cheerio from "cheerio";

const BASE = "https://www.milfat.com";

const fetchHTML = async (url) => {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  return res.data;
};

// 📌 استخراج بيانات القصة من صفحة موضوع
const parseStoryPage = (html) => {
  const $ = cheerio.load(html);

  // العنوان
  const title = $("h1.p-title-value").text().trim();

  // نص القصة (أول مشاركة في الموضوع)
  let story = "";
  $("article.message").first().find(".bbWrapper, .message-body").each((i, el) => {
    const txt = $(el).text().trim();
    if (txt.length > 100) {
      story += txt + "\n\n";
    }
  });

  return {
    title: title || "⚠️ لم يتم العثور على عنوان",
    story: story || "⚠️ لم يتم العثور على نص القصة.",
  };
};

// 📌 البحث عن القصص باسم
const searchStory = async (query) => {
  const searchUrl = `${BASE}/search/search`;
  const res = await axios.post(
    searchUrl,
    new URLSearchParams({
      keywords: query,
      "c[title_only]": 1, // بحث في العناوين فقط
      "c[nodes][]": 15,   // قسم قصص محارم (node id=15)
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36",
      },
    }
  );

  const $ = cheerio.load(res.data);
  const firstLink = $(".contentRow-title a").first().attr("href");

  if (!firstLink) return null;
  const fullUrl = firstLink.startsWith("http") ? firstLink : BASE + firstLink;

  // نجيب صفحة القصة ونفككها
  const storyHtml = await fetchHTML(fullUrl);
  const data = parseStoryPage(storyHtml);
  data.url = fullUrl;

  return data;
};

//////////////////////////////////////////////////////////
// 🔹 Plugin: .milfatsearch <اسم القصة>
//////////////////////////////////////////////////////////
let handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.sendMessage(
      m.chat,
      {
        text: "✍️ اكتب اسم القصة بعد الأمر.\nمثال:\n.milfatsearch سعد واخواته وامو",
      },
      { quoted: m }
    );
    return;
  }

  try {
    const data = await searchStory(text);
    if (!data) {
      await conn.sendMessage(
        m.chat,
        { text: "⚠️ مفيش نتيجة للبحث." },
        { quoted: m }
      );
      return;
    }

    const MAX = 2000;
    const message = `📖 *${data.title}*\n🔗 ${data.url}\n\n${data.story}`;

    if (message.length <= MAX) {
      await conn.sendMessage(m.chat, { text: message }, { quoted: m });
    } else {
      for (let i = 0; i < message.length; i += MAX) {
        await conn.sendMessage(
          m.chat,
          { text: message.slice(i, i + MAX) },
          { quoted: m }
        );
      }
    }
  } catch (err) {
    console.error(err);
    await conn.sendMessage(
      m.chat,
      { text: "⚠️ حصل خطأ أثناء البحث عن القصة." },
      { quoted: m }
    );
  }
};

handler.help = ["milfatsearch <name>"];
handler.tags = ["scraper"];
handler.command = /^milfatsearch$/i;

export default handler;