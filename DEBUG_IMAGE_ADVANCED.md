# Debug-Anleitung: Image Advanced Server-Fehler

## Problem
Du erhältst die Fehlermeldung "Server-Fehler. Bitte versuche es später erneut." beim Versuch, die Image Advanced Funktion zu nutzen.

## Ursachen-Analyse

### 1. Webhook-Status überprüfen

Der Fehler deutet darauf hin, dass der n8n Workflow einen 500er-Fehler zurückgibt. Mögliche Ursachen:

- Der n8n Workflow "Vektrus Image Advanced" ist nicht aktiv/deployed
- Der Workflow hat einen Fehler in der JWT-Validierung
- Der Workflow hat einen internen Fehler (z.B. fehlende API-Keys)

### 2. Debug-Funktion nutzen

Öffne die **Browser DevTools Console** (F12) und führe folgenden Befehl aus:

```javascript
await testImageAdvancedWebhook()
```

Diese Funktion testet den Webhook direkt und gibt detaillierte Informationen aus:

**Erwartete Ausgabe bei Erfolg:**
```
🧪 Testing Image Advanced Webhook...
✅ Session found: [USER-ID]
✅ Access Token (first 20 chars): eyJhbGciOiJIUzI1NiIs...
🔗 Testing webhook: https://n8n.vektrus.ai/webhook/vektrus-image-advanced
📤 Sending test request with payload: {prompt: "A simple test image", count: 1}
📥 Response Status: 200
📥 Response OK: true
📥 Response Body: {"success": true, ...}
```

**Ausgabe bei Fehler:**
```
📥 Response Status: 500
📥 Response OK: false
📥 Response Body: [Fehlermeldung vom n8n Workflow]
```

### 3. Häufige Fehler und Lösungen

#### Fehler 401/403 - Authentifizierung fehlgeschlagen
**Ursache:** Der JWT-Token wird vom n8n Workflow nicht akzeptiert

**Lösung:**
1. Prüfe, ob der n8n Workflow die JWT-Validierung korrekt implementiert hat
2. Stelle sicher, dass der Supabase JWT-Token korrekt übergeben wird
3. Vergleiche mit dem funktionierenden Vektrus Chat Workflow

#### Fehler 404 - Endpunkt nicht gefunden
**Ursache:** Der Workflow ist nicht deployed oder die URL ist falsch

**Lösung:**
1. Prüfe in n8n, ob der Workflow "Vektrus Image Advanced" aktiv ist
2. Stelle sicher, dass der Webhook-Pfad `/webhook/vektrus-image-advanced` ist (NICHT `/webhook-test/`)
3. Überprüfe die URL in `.env`: `VITE_N8N_IMAGE_ADVANCED_URL=https://n8n.vektrus.ai/webhook/vektrus-image-advanced`

#### Fehler 500 - Server-Fehler
**Ursache:** Der Workflow hat einen internen Fehler

**Mögliche Probleme:**
- Fehlende oder ungültige API-Keys (OpenAI, Stability AI, etc.)
- Fehler in der Workflow-Logik
- Datenbank-Verbindungsprobleme
- Timeout bei der Bildgenerierung

**Lösung:**
1. Öffne den n8n Workflow in n8n.vektrus.ai
2. Prüfe die Execution-Logs für den fehlgeschlagenen Request
3. Stelle sicher, dass alle API-Keys konfiguriert sind
4. Teste den Workflow manuell in n8n

### 4. Vergleich mit funktionierendem Vektrus Chat

Die Authentifizierung ist **identisch** implementiert:

**Vektrus Chat:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
fetch(N8N_WEBHOOK_URL, {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
})
```

**Vektrus Image Advanced:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
fetch(webhookUrl, {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
})
```

Wenn Vektrus Chat funktioniert, aber Image Advanced nicht, liegt das Problem **definitiv im n8n Workflow**, nicht im Frontend-Code.

### 5. n8n Workflow Checkliste

Stelle im n8n Workflow sicher:

- [ ] Workflow ist **aktiv** und **deployed**
- [ ] Webhook-Trigger ist korrekt konfiguriert (POST-Methode)
- [ ] JWT-Validierung funktioniert (kopiere vom Chat-Workflow)
- [ ] Alle API-Keys sind gesetzt (OpenAI, Stability AI, etc.)
- [ ] Supabase-Verbindung funktioniert
- [ ] Error-Handling ist implementiert
- [ ] Response-Format ist korrekt: `{ success: boolean, data: {...} }`

### 6. Nächste Schritte

1. **Teste mit Debug-Funktion:** `await testImageAdvancedWebhook()`
2. **Prüfe n8n Logs:** Öffne n8n.vektrus.ai und schaue die Execution-Logs an
3. **Vergleiche mit Chat-Workflow:** Kopiere die JWT-Validierung vom funktionierenden Chat-Workflow
4. **Teste Schritt für Schritt:** Deaktiviere die Bildgenerierung temporär und teste nur die Authentifizierung

## Erweiterte Console-Befehle

### JWT-Token anzeigen
```javascript
const { data } = await supabase.auth.getSession();
console.log('Full Token:', data.session.access_token);
```

### Payload inspizieren
```javascript
const payload = {
  prompt: 'Test image',
  inspiration_image_url: undefined,
  product_image_url: undefined,
  count: 1
};
console.log('Payload:', JSON.stringify(payload, null, 2));
```

### Manuelle Anfrage senden
```javascript
const { data: { session } } = await supabase.auth.getSession();
const response = await fetch('https://n8n.vektrus.ai/webhook/vektrus-image-advanced', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ prompt: 'Test', count: 1 })
});
const result = await response.json();
console.log('Result:', result);
```

## Support

Falls das Problem weiterhin besteht, sende folgende Informationen:

1. Console-Output von `testImageAdvancedWebhook()`
2. n8n Execution-Logs des fehlgeschlagenen Requests
3. Response Status Code und Body
4. Funktioniert Vektrus Chat korrekt? (Ja/Nein)
