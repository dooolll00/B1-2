import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key && /^https:\/\//.test(url));
export const supabase = configured ? createClient(url, key) : null;
let sessionRequest;
export async function ensureSession() {
  if (!supabase) throw new Error('Supabase 연결 설정이 필요합니다. 이용 안내를 확인해 주세요.');
  if (!sessionRequest) sessionRequest = (async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session) return data.session.user;
    const result = await supabase.auth.signInAnonymously();
    if (result.error) throw result.error;
    return result.data.user;
  })().finally(() => { sessionRequest = null; });
  return sessionRequest;
}
