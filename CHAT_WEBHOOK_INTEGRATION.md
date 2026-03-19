# Chat-Webhook Integration mit JWT Token

## Problem
Das Chat-System sendete keine Daten an den n8n Webhook, weil:
1. Die alte Edge Function nutzte BOLT DB Secrets (N8N_BASIC_USER, N8N_BASIC_PASS)
2. Keine JWT Token Authentifizierung vorhanden war
3. User-Daten nicht aus der Supabase-Datenbank kamen

## Lösung
Die komplette Webhook-Integration wurde auf JWT Token-basierte Authentifizierung umgestellt.

---

## Geänderte Dateien

### 1. Frontend Services

#### `src/services/vektrusChatService.ts`
**Änderungen:**
- JWT Token wird von `supabase.auth.getSession()` geholt
- `Authorization: Bearer ${session.access_token}` Header hinzugefügt
- `userId` Parameter aus Request-Body entfernt (kommt aus JWT)
- Auth-Prüfung: Wirft Fehler wenn User nicht eingeloggt

**Vorher:**
```typescript
const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,  // ❌ Falsch
    "apikey": SUPABASE_ANON_KEY
  },
  body: JSON.stringify({
    message,
    userId  // ❌ User ID manuell
  })
});
```

**Nachher:**
```typescript
const { data: { session } } = await supabase.auth.getSession();

if (!session?.access_token) {
  throw new Error('User not authenticated');
}

const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${session.access_token}`,  // ✅ JWT Token
    "apikey": SUPABASE_ANON_KEY
  },
  body: JSON.stringify({
    message  // ✅ User ID kommt aus JWT
  })
});
```

#### `src/services/contentGenerator.ts`
**Änderungen:**
- Gleiche JWT Token Integration wie vektrusChatService
- `user_id` aus Request-Body entfernt
- Auth-Prüfung vor Webhook-Aufruf

---

### 2. Edge Function

#### `supabase/functions/vektrus-chat/index.ts`
**Komplette Überarbeitung:**

##### A) JWT Token Verifizierung
```typescript
const authHeader = req.headers.get('Authorization');
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return new Response(
    JSON.stringify({ error: "Missing or invalid Authorization header" }),
    { status: 401, headers: corsHeaders }
  );
}

const jwt = authHeader.replace('Bearer ', '');
```

##### B) Supabase Client für User-Daten
```typescript
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    global: {
      headers: { Authorization: authHeader },
    },
  }
);

// JWT validieren und User abrufen
const { data: { user }, error: userError } =
  await supabaseClient.auth.getUser(jwt);

if (userError || !user) {
  return new Response(
    JSON.stringify({ error: "Invalid or expired token" }),
    { status: 401, headers: corsHeaders }
  );
}
```

##### C) User-Profil aus Supabase DB
```typescript
const { data: userProfile } = await supabaseClient
  .from('users')
  .select('email, first_name, subscription_tier')
  .eq('id', user.id)
  .maybeSingle();
```

##### D) n8n Webhook mit JWT Token
```typescript
const webhookUrl = "https://n8n.vektrus.ai/webhook/vektrus-chat";

const n8nBody = {
  message,
  user_id: user.id,  // ✅ Aus JWT Token
  username: userProfile?.first_name || user.email?.split('@')[0] || "User",
  email: user.email,
  language: "de",
  plan: userProfile?.subscription_tier || "trial",
  environment: "production"
};

const res = await fetch(webhookUrl, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${jwt}`,  // ✅ JWT Token an n8n
    "Content-Type": "application/json"
  },
  body: JSON.stringify(n8nBody)
});
```

---

## Entfernte Dependencies
- ❌ BOLT DB Secrets (N8N_BASIC_USER, N8N_BASIC_PASS, N8N_WEBHOOK_URL)
- ❌ Basic Auth für n8n
- ❌ Manuelles userId Handling

## Neue Dependencies
- ✅ Supabase JWT Token Authentifizierung
- ✅ User-Daten aus Supabase Database
- ✅ Automatische User-ID Extraktion aus JWT

---

## Datenfluss

```
1. User schreibt Nachricht im Frontend
   └─> Frontend: vektrusChatService.ts

2. JWT Token von Supabase Auth holen
   └─> supabase.auth.getSession()

3. Request an Supabase Edge Function
   └─> Authorization: Bearer {JWT_TOKEN}
   └─> Body: { message: "..." }

4. Edge Function verifiziert JWT
   └─> supabaseClient.auth.getUser(jwt)
   └─> User-Daten aus 'users' Tabelle

5. Edge Function sendet an n8n Webhook
   └─> https://n8n.vektrus.ai/webhook/vektrus-chat
   └─> Authorization: Bearer {JWT_TOKEN}
   └─> Body: {
         message,
         user_id,      // ✅ Aus JWT
         username,     // ✅ Aus Supabase DB
         email,        // ✅ Aus Supabase Auth
         plan,         // ✅ Aus Supabase DB
         language,
         environment
       }

6. n8n verarbeitet Request
   └─> Kann JWT Token validieren
   └─> User-ID ist verifiziert

7. Response zurück zum Frontend
   └─> Chat zeigt AI-Antwort
```

---

## Sicherheit

### Vorher (❌ Unsicher)
- Basic Auth Credentials in Edge Function
- User-ID wurde vom Frontend geschickt (manipulierbar)
- Keine echte Authentifizierung

### Nachher (✅ Sicher)
- JWT Token Authentifizierung
- User-ID aus verifiziertem JWT Token
- Supabase validiert jeden Request
- n8n erhält verifizierten JWT Token

---

## Testing

### Im Frontend testen:
1. User muss eingeloggt sein (Supabase Auth)
2. Chat öffnen im Dashboard
3. "Live-Modus" Button aktivieren
4. Nachricht senden
5. Console prüfen:
   ```
   Authenticated user: {user_id} {email}
   Calling n8n webhook: https://n8n.vektrus.ai/webhook/vektrus-chat
   ```

### Edge Function Logs prüfen:
```bash
# Supabase Dashboard → Edge Functions → vektrus-chat → Logs
```

Erwartete Logs:
```
Authenticated user: abc123 user@example.com
Calling n8n webhook: https://n8n.vektrus.ai/webhook/vektrus-chat
Request body: {"message":"...","user_id":"***",...}
n8n response status: 200
```

---

## Troubleshooting

### Problem: "User not authenticated"
**Lösung:** User ist nicht eingeloggt
- Im Frontend einloggen
- Session prüfen: `supabase.auth.getSession()`

### Problem: "Invalid or expired token"
**Lösung:** JWT Token ist abgelaufen
- User automatisch ausloggen
- Neu einloggen lassen

### Problem: "Failed to reach n8n"
**Lösung:** n8n Webhook nicht erreichbar
- n8n URL prüfen: `https://n8n.vektrus.ai/webhook/vektrus-chat`
- Netzwerk-Verbindung prüfen
- n8n Server Status prüfen

### Problem: User-Daten fehlen
**Lösung:** User noch nicht in 'users' Tabelle
- Signup-Prozess prüfen
- useAuth.tsx → signUp() prüft ob User-Profil erstellt wird

---

## Edge Function Deployment

Die Edge Function wurde aktualisiert in:
`supabase/functions/vektrus-chat/index.ts`

**Manuelles Deployment (falls nötig):**
```bash
# In Supabase Dashboard:
# 1. Edge Functions → vektrus-chat
# 2. Code aus index.ts kopieren
# 3. Deploy Button klicken
```

**Wichtig:** Die Edge Function benötigt diese Environment Variables:
- `SUPABASE_URL` (automatisch gesetzt)
- `SUPABASE_ANON_KEY` (automatisch gesetzt)

❌ **NICHT mehr benötigt:**
- N8N_BASIC_USER
- N8N_BASIC_PASS
- N8N_WEBHOOK_URL
- VEKTRUS_DEMO_USER_ID

---

## Zusammenfassung

✅ **Erfolgreich umgesetzt:**
1. JWT Token Authentifizierung im Frontend
2. User-Daten aus Supabase Database
3. JWT Token Verifizierung in Edge Function
4. Sicherer n8n Webhook-Aufruf mit JWT
5. BOLT DB Secrets entfernt
6. Production-ready Code

✅ **Build erfolgreich:** `npm run build` ohne Fehler

✅ **Nächste Schritte für User:**
1. User-Account erstellen / einloggen
2. Chat im Dashboard öffnen
3. "Live-Modus" aktivieren
4. Nachrichten senden → n8n erhält JWT-verified Daten
