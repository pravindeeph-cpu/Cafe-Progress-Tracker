import { useCallback, useEffect, useState } from 'react';
import { apiCreate, apiDelete, apiList, apiUpdate } from '../api';

interface WithId {
  id: number;
}

export function useResource<T extends WithId>(resource: string, query?: Record<string, string | number>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiList<T>(resource, query);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, JSON.stringify(query)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (draft: Partial<T>) => {
      const created = await apiCreate<T>(resource, draft);
      setRows((prev) => [...prev, created]);
      return created;
    },
    [resource]
  );

  const update = useCallback(
    async (id: number, patch: Partial<T>) => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      const updated = await apiUpdate<T>(resource, id, patch);
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return updated;
    },
    [resource]
  );

  const remove = useCallback(
    async (id: number) => {
      setRows((prev) => prev.filter((r) => r.id !== id));
      await apiDelete(resource, id);
    },
    [resource]
  );

  return { rows, loading, error, refresh, add, update, remove };
}
