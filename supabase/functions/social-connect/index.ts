import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VALID_PLATFORMS = [
  "instagram",
  "facebook",
  "linkedin",
  "twitter",
  "tiktok",
  "youtube",
  "threads",
  "pinterest",
  "reddit",
  "bluesky",
  "googlebusiness",
  "telegram",
  "snapchat",
];

interface ConnectRequest {
  platform: string;
  redirect_url: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "METHOD_NOT_ALLOWED", message: "Only POST allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "Kein/ungültiger Token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lateApiKey = Deno.env.get("LATE_API_KEY");

    if (!lateApiKey) {
      return new Response(
        JSON.stringify({ error: "CONFIG_ERROR", message: "LATE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "Kein/ungültiger Token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (userDataError || !userData) {
      return new Response(
        JSON.stringify({ error: "USER_NOT_FOUND", message: "User nicht gefunden" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const internalUserId = userData.id;

    let body: ConnectRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "INVALID_REQUEST", message: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { platform, redirect_url } = body;

    if (!platform || !VALID_PLATFORMS.includes(platform.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: "INVALID_PLATFORM", message: "Platform ungültig" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!redirect_url) {
      return new Response(
        JSON.stringify({ error: "MISSING_REDIRECT", message: "redirect_url fehlt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: lateProfile, error: profileError } = await supabase
      .from("late_profiles")
      .select("late_profile_id")
      .eq("user_id", internalUserId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching late profile:", profileError);
      return new Response(
        JSON.stringify({ error: "DB_ERROR", message: "Datenbankfehler" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lateProfile) {
      return new Response(
        JSON.stringify({ error: "NO_LATE_PROFILE", message: "Kein Late Profile gefunden" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lateApiUrl = `https://getlate.dev/api/v1/connect/${platform.toLowerCase()}?profileId=${encodeURIComponent(lateProfile.late_profile_id)}&redirect_url=${encodeURIComponent(redirect_url)}`;

    const lateResponse = await fetch(lateApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${lateApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!lateResponse.ok) {
      const errorText = await lateResponse.text();
      console.error("Late API error:", lateResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "LATE_API_ERROR", message: "Late API Fehler", details: errorText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lateData = await lateResponse.json();

    if (!lateData.authUrl) {
      return new Response(
        JSON.stringify({ error: "LATE_API_ERROR", message: "Keine authUrl von Late erhalten" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        authUrl: lateData.authUrl,
        platform: platform.toLowerCase(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: "Interner Serverfehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
