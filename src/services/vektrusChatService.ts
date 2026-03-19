import { supabase } from '../lib/supabase';

export interface VektrusChatResponse {
  output?: string;
  raw?: string;
  error?: string;
  workflowStatus?: WorkflowStatusUpdate;
}

export interface WorkflowStatusUpdate {
  currentStep: string;
  stepLabel: string;
  progress: number;
  steps: Array<{
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed';
  }>;
}

export async function sendVektrusMessage(
  message: string,
  sessionId: string,
  imageUrl?: string
): Promise<VektrusChatResponse> {
  const body: any = {
    path: 'chat',
    message: message,
    session_id: sessionId
  };

  if (imageUrl) {
    body.images = [imageUrl];
  }

  const { data, error } = await supabase.functions.invoke('n8n-proxy', {
    body
  });

  if (error) {
    throw new Error(error.message || 'Chat request failed');
  }

  return data;
}

export async function sendVektrusMessageWithStatus(
  message: string,
  sessionId: string,
  onStatusUpdate?: (status: WorkflowStatusUpdate) => void,
  imageUrl?: string
): Promise<VektrusChatResponse> {
  const workflowSteps = [
    { id: 'analyze', label: 'Analysiere deine Anfrage...', duration: 1200 },
    { id: 'research', label: 'Durchsuche relevante Quellen...', duration: 1500 },
    { id: 'generate', label: 'Erstelle personalisierten Content...', duration: 2000 },
    { id: 'optimize', label: 'Optimiere für deine Zielgruppe...', duration: 1800 },
    { id: 'finalize', label: 'Finalisiere Empfehlungen...', duration: 1000 }
  ];

  let animationCancelled = false;

  const animateWorkflow = async () => {
    for (let i = 0; i < workflowSteps.length && !animationCancelled; i++) {
      const step = workflowSteps[i];

      onStatusUpdate?.({
        currentStep: step.id,
        stepLabel: step.label,
        progress: ((i + 1) / workflowSteps.length) * 100,
        steps: workflowSteps.map((s, idx) => ({
          id: s.id,
          label: s.label,
          status: idx < i ? 'completed' : idx === i ? 'active' : 'pending'
        }))
      });

      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    if (!animationCancelled) {
      onStatusUpdate?.({
        currentStep: 'done',
        stepLabel: 'Fertig!',
        progress: 100,
        steps: workflowSteps.map(s => ({
          id: s.id,
          label: s.label,
          status: 'completed'
        }))
      });
    }
  };

  const fetchResponse = async (): Promise<VektrusChatResponse> => {
    const body: any = {
      path: 'chat',
      message: message,
      session_id: sessionId
    };

    if (imageUrl) {
      body.images = [imageUrl];
    }

    const { data, error } = await supabase.functions.invoke('n8n-proxy', {
      body
    });

    if (error) {
      throw new Error(error.message || 'Chat request failed');
    }

    return data;
  };

  if (onStatusUpdate) {
    const animationPromise = animateWorkflow();

    try {
      const response = await fetchResponse();
      animationCancelled = true;
      return response;
    } catch (error) {
      animationCancelled = true;
      throw error;
    }
  } else {
    return await fetchResponse();
  }
}