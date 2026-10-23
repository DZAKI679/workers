
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET" || url.pathname !== "/search") {
      return Response.json(
        { error: "Gunakan /search?keyword=勉強" },
        { status: 404, headers: corsHeaders }
      );
    }

    const keyword = (url.searchParams.get("keyword") || "").trim();

    if (!keyword || keyword.length > 100) {
      return Response.json(
        { error: "Keyword kosong atau terlalu panjang" },
        { status: 400, headers: corsHeaders }
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
      return Response.json(
        { error: "Gagal mengambil data Jisho" },
        { status: 502, headers: corsHeaders }
      );
    }
  },
};
