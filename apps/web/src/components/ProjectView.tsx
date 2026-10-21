'use client';

import { useEffect, useState } from 'react';
import { loadProject, type ProjectBundle } from '@/lib/api';

export function useProject(id: string) {
  const [bundle, setBundle] = useState<ProjectBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const data = await loadProject(id);
      setBundle(data);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { bundle, error, loading, setBundle, refresh };
}
