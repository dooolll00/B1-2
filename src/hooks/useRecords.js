import { useCallback, useEffect, useState } from 'react';
import { listRecords, getRecord } from '../lib/records';
export function useRemote(loader) {
  const [state, setState] = useState({
    loader,
    revision: 0,
    data: null,
    loading: true,
    error: null,
  });
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision((n) => n + 1), []);
  useEffect(() => {
    let active = true;
    setState({ loader, revision, data: null, loading: true, error: null });
    Promise.resolve()
      .then(loader)
      .then((data) => {
        if (active)
          setState({ loader, revision, data, loading: false, error: null });
      })
      .catch((error) => {
        if (active)
          setState({ loader, revision, data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [loader, revision]);
  // 새 요청의 effect가 실행되기 전에도 이전 기록을 노출하지 않습니다.
  if (state.loader !== loader || state.revision !== revision)
    return { data: null, loading: true, error: null, retry };
  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    retry,
  };
}
export function useRecords() {
  return useRemote(listRecords);
}
export function useRecord(id) {
  return useRemote(useCallback(() => getRecord(id), [id]));
}
