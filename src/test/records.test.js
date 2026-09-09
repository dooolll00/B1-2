import { beforeEach, expect, it, vi } from 'vitest';
import { getRecord } from '../lib/records';
import { ensureSession, supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  ensureSession: vi.fn(),
  supabase: { from: vi.fn() },
}));

beforeEach(() => vi.resetAllMocks());

it.each(['invalid', '123', '', undefined])(
  '잘못된 ID %s는 로그인과 조회 없이 없는 기록으로 처리한다',
  async (id) => {
    await expect(getRecord(id)).resolves.toBeNull();
    expect(ensureSession).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  },
);

it('올바른 ID는 인증 오류를 전달하고 데이터 조회를 중단한다', async () => {
  ensureSession.mockRejectedValue(new Error('인증 실패'));
  await expect(
    getRecord('11111111-1111-4111-8111-111111111111'),
  ).rejects.toThrow('인증 실패');
  expect(ensureSession).toHaveBeenCalledOnce();
  expect(supabase.from).not.toHaveBeenCalled();
});
