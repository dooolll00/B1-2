import { supabase, ensureSession } from './supabase';
export const categories = ['React', 'JavaScript', 'CSS', '기타'];
export const statuses = ['학습 중', '복습 필요', '학습 완료'];
export function validateRecord(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = '제목을 입력해 주세요.';
  else if (values.title.trim().length > 80)
    errors.title = '제목은 80자 이하로 입력해 주세요.';
  if (!values.content.trim()) errors.content = '배운 내용을 입력해 주세요.';
  else if (values.content.trim().length > 10000)
    errors.content = '내용은 10,000자 이하로 입력해 주세요.';
  if (!categories.includes(values.category))
    errors.category = '주제를 선택해 주세요.';
  if (!statuses.includes(values.status))
    errors.status = '학습 상태를 선택해 주세요.';
  return errors;
}
export async function listRecords() {
  await ensureSession();
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function getRecord(id) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return null;
  await ensureSession();
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
export async function saveRecord(values, id) {
  if (Object.keys(validateRecord(values)).length)
    throw new Error('입력 내용을 확인해 주세요.');
  const user = await ensureSession();
  const payload = {
    title: values.title.trim(),
    content: values.content.trim(),
    category: values.category,
    status: values.status,
  };
  const query = id
    ? supabase.from('records').update(payload).eq('id', id)
    : supabase.from('records').insert({ ...payload, user_id: user.id });
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}
export async function deleteRecord(id) {
  await ensureSession();
  const { data, error } = await supabase
    .from('records')
    .delete()
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
  return data;
}
