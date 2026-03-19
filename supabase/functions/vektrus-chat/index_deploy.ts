import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);

    if (userError || !user) {
      console.error("JWT verification failed:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id, user.email);

    const { data: userProfile } = await supabaseClient
      .from('users')
      .select('email, first_name, subscription_tier')
      .eq('id', user.id)
      .maybeSingle();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid or empty JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message } = body;
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Missing 'message' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookUrl = "https://n8n.vektrus.ai/webhook/vektrus-chat";

    const n8nBody = {
      message,
      user_id: user.id,
      username: userProfile?.first_name || user.email?.split('@')[0] || "User",
      email: user.email,
      language: "de",
      plan: userProfile?.subscription_tier || "trial",
      environment: "production"
    };

    console.log("Calling n8n webhook:", webhookUrl);
    console.log("Request body:", JSON.stringify({ ...n8nBody, user_id: '***' }));

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(n8nBody)
    });

    console.log("n8n response status:", res.status);

    const data = await res.text();
    console.log("n8n response data:", data);

    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = { raw: data };
    }

    return new Response(JSON.stringify(parsed), {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("Error sending to n8n:", err);
    console.error("Error stack:", err.stack);
    return new Response(
      JSON.stringify({
        error: "Failed to reach n8n",
        details: err.message,
        type: err.name
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
