
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return json({ error: "Gunakan metode GET" }, 405);
    }

    // ===== JISHO SEARCH =====
    if (url.pathname === "/search") {
      const keyword = (url.searchParams.get("keyword") || "").trim();

      if (!keyword || keyword.length > 100) {
        return json(
          { error: "Keyword kosong atau terlalu panjang" },
          400
        );
      }

      try {
        const response = await fetch(
          "https://jisho.org/api/v1/search/words?keyword=" +
            encodeURIComponent(keyword)
        );

        return new Response(await response.text(), {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Cache-Control": "public, max-age=300",
          },
        });
      } catch {
        return json({ error: "Gagal mengambil data Jisho" }, 502);
      }
    }

    // ===== ENGLISH TO INDONESIAN =====
    if (url.pathname === "/translate") {
      const text = (url.searchParams.get("text") || "").trim();

      if (!text || text.length > 500) {
        return json(
          { error: "Teks kosong atau terlalu panjang (maksimal 500 karakter)" },
          400
        );
      }

      try {
        const apiUrl = new URL(
          "https://api.mymemory.translated.net/get"
        );

        apiUrl.searchParams.set("q", text);
        apiUrl.searchParams.set("langpair", "en|id");

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (
          !response.ok ||
          data.responseStatus !== 200 ||
          !data.responseData?.translatedText
        ) {
          return json({ error: "Terjemahan gagal" }, 502);
        }

        return json({
          original: text,
          translation: data.responseData.translatedText,
        });
      } catch {
        return json(
          { error: "Layanan terjemahan tidak tersedia" },
          502
        );
      }
    }

    return json(
      { error: "Gunakan /search?keyword=勉強 atau /translate?text=study" },
      404
    );
  },
};
