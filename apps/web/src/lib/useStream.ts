'use client';

import { useState, useRef, useCallback } from 'react';
import type { ProjectBundle } from './api';

export interface StreamEvent {
  stage: string;
  message: string;
  at: string;
}

export interface UseStreamResult {
  streaming: boolean;
  events: StreamEvent[];
  bundle: ProjectBundle | null;
  error: string | null;
  start: (body?: Record<string, unknown>) => Promise<void>;
  cancel: () => void;
}

export function useStream(
  projectId: string,
  action: 'analyze' | 'design' | 'visualize' | 'review' | 'counterfactual',
  onDone?: (bundle: ProjectBundle) => void
): UseStreamResult {
  const [streaming, setStreaming] = useState(false);
  const [events, setEvents]       = useState<StreamEvent[]>([]);
  const [bundle, setBundle]        = useState<ProjectBundle | null>(null);
  const [error, setError]          = useState<string | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const cancel = useCallback(() => {
    readerRef.current?.cancel().catch(() => {});
    setStreaming(false);
  }, []);

  const start = useCallback(async (body: Record<string, unknown> = {}) => {
    setStreaming(true);
    setEvents([]);
    setBundle(null);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error('No response body');

      const reader  = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'progress') {
              setEvents((prev) => [...prev, { stage: event.stage, message: event.message, at: event.at }]);
            } else if (event.type === 'done') {
              const b = event.bundle as ProjectBundle;
              setBundle(b);
              onDone?.(b);
              setStreaming(false);
            } else if (event.type === 'error') {
              setError(event.message ?? 'Unknown error');
              setStreaming(false);
            }
          } catch {
            // malformed event — ignore
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStreaming(false);
    }
  }, [projectId, action, onDone]);

  return { streaming, events, bundle, error, start, cancel };
}
