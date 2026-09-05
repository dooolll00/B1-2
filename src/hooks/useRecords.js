import { useCallback, useEffect, useState } from 'react';
import { listRecords, getRecord } from '../lib/records';
export function useRemote(loader) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision((n) => n + 1), []);
  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });
    Promise.resolve()
      .then(loader)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [loader, revision]);
  return { ...state, retry };
}
export function useRecords() {
  return useRemote(listRecords);
}
export function useRecord(id) {
  return useRemote(useCallback(() => getRecord(id), [id]));
}
