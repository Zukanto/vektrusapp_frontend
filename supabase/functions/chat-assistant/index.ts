import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENAI_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

Deno.serve(async (req: Request) => {
  try {
    // Check if OpenAI key is available
    if (!OPENAI_KEY) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your Supabase project settings.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { threadId, content } = await req.json();
    if (!threadId || !content) {
      return new Response(JSON.stringify({ error: 'Missing threadId or content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's team
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .single();

    if (teamError || !teamMember) {
      return new Response(JSON.stringify({ error: 'User not assigned to team' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get assistant configuration for team
    const { data: aiConfig, error: configError } = await supabase
      .from('team_ai_config')
      .select('assistant_id')
      .eq('team_id', teamMember.team_id)
      .single();

    if (configError || !aiConfig) {
      return new Response(JSON.stringify({ error: 'No AI assistant configured for team' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get or create chat thread
    let { data: thread, error: threadError } = await supabase
      .from('chat_threads')
      .select('*')
      .eq('id', threadId)
      .eq('team_id', teamMember.team_id)
      .single();

    if (threadError || !thread) {
      return new Response(JSON.stringify({ error: 'Thread not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ensure OpenAI thread exists
    let openaiThreadId = thread.openai_thread_id;
    if (!openaiThreadId) {
      console.log('Creating new OpenAI thread...');
      // Create new OpenAI thread
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        const errorText = await threadResponse.text();
        console.error('OpenAI thread creation failed:', {
          status: threadResponse.status,
          statusText: threadResponse.statusText,
          error: errorText,
          hasApiKey: !!OPENAI_KEY,
          apiKeyLength: OPENAI_KEY?.length || 0
        });
        return new Response(JSON.stringify({ error: 'Failed to create OpenAI thread' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const threadData = await threadResponse.json();
      openaiThreadId = threadData.id;
      console.log('OpenAI thread created successfully:', openaiThreadId);

      // Update chat_threads with OpenAI thread ID
      await supabase
        .from('chat_threads')
        .update({ openai_thread_id: openaiThreadId })
        .eq('id', threadId);
    }

    // Add message to OpenAI thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${openaiThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: content
      })
    });

    if (!messageResponse.ok) {
      console.error('OpenAI message creation failed:', await messageResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to add message to OpenAI thread' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Start OpenAI run (non-streaming)
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${openaiThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: aiConfig.assistant_id,
        instructions: `Du bist Vektrus AI, ein professioneller Social Media Assistent. Du kennst das Unternehmen, die Zielgruppe und die Branche des Users bereits durch vorherige Onboarding-Daten.

WICHTIG - KEINE GEGENFRAGEN:
- Stelle NIEMALS Rückfragen wie "Was ist dein Business?" oder "Wer ist deine Zielgruppe?"
- Du kennst diese Informationen bereits aus dem Team-Profil
- Liefere IMMER direkt konkrete, umsetzbare Empfehlungen
- Wenn spezifische Details fehlen, gib allgemeine Best Practices für die Branche

DEIN VERHALTEN:
- Antworte IMMER auf Deutsch
- Gib sofort praktische Vorschläge ohne Nachfragen
- Erstelle konkrete Content-Ideen, Pläne oder Strategien
- Nutze strukturierte Formate (Bullet Points, Nummerierungen, Tabellen)
- Sei präzise und actionable
- Verwende "Du" und einen motivierenden Ton
- Nutze Emojis gezielt zur Strukturierung

AUSGABEFORMAT:
Bei Post-Ideen: Titel, Hook, Format, Zielgruppen-Fit
Bei Content-Plänen: Wochentage, Uhrzeiten, Formate, Themen
Bei Captions: 3 Varianten mit Hooks, CTAs und Hashtags
Bei Analysen: Konkrete Empfehlungen mit Begründung

Liefere IMMER vollständige, direkt umsetzbare Ergebnisse ohne Rückfragen!`,
        stream: false
      })
    });

    if (!runResponse.ok) {
      console.error('OpenAI run creation failed:', await runResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to start OpenAI run' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const runData = await runResponse.json();
    const runId = runData.id;

    // Poll for completion
    let run = runData;
    while (run.status === 'queued' || run.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const pollResponse = await fetch(`https://api.openai.com/v1/threads/${openaiThreadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!pollResponse.ok) {
        console.error('OpenAI run polling failed:', await pollResponse.text());
        return new Response(JSON.stringify({ error: 'Failed to poll OpenAI run' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      run = await pollResponse.json();
    }

    if (run.status !== 'completed') {
      console.error('OpenAI run failed:', run);
      return new Response(JSON.stringify({ error: `OpenAI run failed with status: ${run.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the assistant's response
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${openaiThreadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!messagesResponse.ok) {
      console.error('Failed to get messages:', await messagesResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to get assistant response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const messagesData = await messagesResponse.json();
    const assistantMessage = messagesData.data.find((msg: any) => msg.role === 'assistant');
    
    if (!assistantMessage) {
      return new Response(JSON.stringify({ error: 'No assistant response found' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseContent = assistantMessage.content[0]?.text?.value || 'Keine Antwort erhalten.';

    // Create single assistant message in database
    const { data: newMessage, error: createError } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        team_id: teamMember.team_id,
        role: 'assistant',
        content: responseContent,
        status: 'committed'
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create assistant message:', createError);
      return new Response(JSON.stringify({ error: 'Failed to save assistant message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update thread timestamp
    await supabase
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    return new Response(JSON.stringify({ 
      message: newMessage,
      content: responseContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Chat assistant error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});