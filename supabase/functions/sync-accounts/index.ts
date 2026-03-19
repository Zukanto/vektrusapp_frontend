import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LateAccount {
  _id: string;
  platform: string;
  username?: string;
  displayName?: string;
  profilePicture?: string;
  platformUserId?: string;
  accountType?: string;
}

interface LateAccountsResponse {
  accounts: LateAccount[];
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
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lateApiKey = Deno.env.get("LATE_API_KEY");

    if (!lateApiKey) {
      return new Response(
        JSON.stringify({ error: "CONFIG_ERROR", message: "LATE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "Kein/ungültiger Token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: userData, error: userDataError } = await supabaseUser
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

    const { data: lateProfile, error: profileError } = await supabaseUser
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

    const lateApiUrl = `https://getlate.dev/api/v1/accounts?profileId=${encodeURIComponent(lateProfile.late_profile_id)}`;

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

    const lateData: LateAccountsResponse = await lateResponse.json();
    const lateAccounts = lateData.accounts || [];

    const syncedAccountIds: string[] = [];
    const syncedAccounts: Array<{
      platform: string;
      username: string | null;
      display_name: string | null;
      is_active: boolean;
    }> = [];

    for (const account of lateAccounts) {
      const accountData = {
        user_id: internalUserId,
        late_profile_id: lateProfile.late_profile_id,
        late_account_id: account._id,
        platform: account.platform,
        username: account.username || null,
        display_name: account.displayName || null,
        profile_picture: account.profilePicture || null,
        platform_user_id: account.platformUserId || null,
        account_type: account.accountType || null,
        late_api_data: account,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabaseAdmin
        .from("late_accounts")
        .upsert(accountData, {
          onConflict: "late_account_id",
        });

      if (upsertError) {
        console.error("Error upserting account:", upsertError);
        continue;
      }

      syncedAccountIds.push(account._id);
      syncedAccounts.push({
        platform: account.platform,
        username: account.username || null,
        display_name: account.displayName || null,
        is_active: true,
      });
    }

    if (syncedAccountIds.length > 0) {
      const { error: deactivateError } = await supabaseAdmin
        .from("late_accounts")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("user_id", internalUserId)
        .eq("late_profile_id", lateProfile.late_profile_id)
        .not("late_account_id", "in", `(${syncedAccountIds.map(id => `"${id}"`).join(",")})`);

      if (deactivateError) {
        console.error("Error deactivating old accounts:", deactivateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedAccounts.length,
        accounts: syncedAccounts,
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
