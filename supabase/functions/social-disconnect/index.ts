import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DisconnectRequest {
  accountId: string;
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
        JSON.stringify({ error: "UNAUTHORIZED", message: "Nicht angemeldet" }),
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
        JSON.stringify({ error: "UNAUTHORIZED", message: "Nicht angemeldet" }),
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

    let body: DisconnectRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "INVALID_REQUEST", message: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { accountId } = body;

    if (!accountId) {
      return new Response(
        JSON.stringify({ error: "MISSING_ACCOUNT_ID", message: "accountId fehlt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: account, error: accountError } = await supabase
      .from("late_accounts")
      .select("*")
      .eq("late_account_id", accountId)
      .eq("user_id", internalUserId)
      .maybeSingle();

    if (accountError) {
      console.error("Error fetching account:", accountError);
      return new Response(
        JSON.stringify({ error: "DB_ERROR", message: "Datenbankfehler" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!account) {
      return new Response(
        JSON.stringify({ error: "FORBIDDEN", message: "Account nicht gefunden oder gehört nicht dir" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lateApiUrl = `https://getlate.dev/api/v1/accounts/${encodeURIComponent(accountId)}`;
    console.log(`[social-disconnect] Calling Late API: DELETE ${lateApiUrl}`);

    const lateResponse = await fetch(lateApiUrl, {
      method: "DELETE",
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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: deleteError } = await supabase
      .from("late_accounts")
      .delete()
      .eq("late_account_id", accountId)
      .eq("user_id", internalUserId);

    if (deleteError) {
      console.error("Error deleting account from DB:", deleteError);
      return new Response(
        JSON.stringify({ error: "DB_ERROR", message: "Account konnte nicht aus der Datenbank entfernt werden" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[social-disconnect] Account ${accountId} (${account.platform}) successfully disconnected for user ${internalUserId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account erfolgreich getrennt",
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
