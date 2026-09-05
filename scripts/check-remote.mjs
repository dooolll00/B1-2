import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

// Creates an anonymous test session and deletes only the record created by this run.
const env = Object.fromEntries(
  (await readFile(new URL('../.env', import.meta.url), 'utf8'))
    .trim()
    .split('\n')
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i), line.slice(i + 1).trim()];
    }),
);
const db = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
let recordId;
function check(result, step) {
  if (result.error) throw new Error(`${step}: ${result.error.message}`);
  console.log(`PASS ${step}`);
  return result.data;
}
try {
  const auth = check(await db.auth.signInAnonymously(), 'anonymous sign-in');
  check(await db.from('records').select('id').limit(1), 'list');
  const row = check(
    await db
      .from('records')
      .insert({
        user_id: auth.user.id,
        title: 'Connection test',
        content: 'Temporary CRUD verification record',
        category: 'React',
        status: '학습 중',
      })
      .select()
      .single(),
    'create',
  );
  recordId = row.id;
  check(
    await db.from('records').select('*').eq('id', recordId).single(),
    'detail',
  );
  const updated = check(
    await db
      .from('records')
      .update({ title: 'Updated connection test' })
      .eq('id', recordId)
      .select()
      .single(),
    'update',
  );
  if (updated.title !== 'Updated connection test')
    throw new Error('Update value mismatch');
  check(
    await db.from('records').delete().eq('id', recordId).select('id').single(),
    'delete',
  );
  const deleted = check(
    await db.from('records').select('id').eq('id', recordId),
    'verify deletion',
  );
  if (deleted.length) throw new Error('Deleted record still exists');
  recordId = undefined;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (recordId) {
    const result = await db.from('records').delete().eq('id', recordId);
    if (result.error) console.error(`Test record cleanup failed: ${recordId}`);
  }
}
