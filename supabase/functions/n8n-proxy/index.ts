import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const WEBHOOK_MAP: Record<string, string> = {
  "chat": "https://n8n.vektrus.ai/webhook/vektrus-chat",
  "pulse": "https://n8n.vektrus.ai/webhook/vektrus-pulse",
  "pulse-visual": "https://n8n.vektrus.ai/webhook/vektrus-pulse-visual",
  "image-simple": "https://n8n.vektrus.ai/webhook/vektrus-image-simple",
  "image-advanced": "https://n8n.vektrus.ai/webhook/vektrus-image-advanced",
  "vision": "https://n8n.vektrus.ai/webhook/vektrus-vision",
  "post": "https://n8n.vektrus.ai/webhook/vektrus-post",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { path, ...payload } = body;

    if (!path || !WEBHOOK_MAP[path]) {
      return new Response(
        JSON.stringify({
          error: "Invalid path",
          message: `Path "${path}" not found. Available: ${Object.keys(WEBHOOK_MAP).join(", ")}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetUrl = WEBHOOK_MAP[path];
    console.log(`[n8n-proxy] ${path} → ${targetUrl}`);

    const n8nResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`[n8n-proxy] n8n status: ${n8nResponse.status}`);

    const responseData = await n8nResponse.text();

    let parsed;
    try {
      parsed = JSON.parse(responseData);
    } catch {
      parsed = { raw: responseData };
    }

    return new Response(JSON.stringify(parsed), {
      status: n8nResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[n8n-proxy] Error:", err);
    return new Response(
      JSON.stringify({ error: "Proxy error", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
