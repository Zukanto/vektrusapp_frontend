import { useState, useCallback } from 'react';

interface UseChatOpts {
  endpoint: string;
  jwt: string;
}

interface SendArgs {
  threadId: string;
  content: string;
}

export function useChatCompletion({ endpoint, jwt }: UseChatOpts) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (
    { threadId, content }: SendArgs,
    onComplete: (content: string) => void
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${jwt}` 
        },
        body: JSON.stringify({ 
          threadId, 
          content
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      onComplete(data.content);
    } catch (err: any) {
      setError(err.message ?? "request_error");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, jwt]);

  return { 
    send,
    isLoading, 
    error 
  };
}