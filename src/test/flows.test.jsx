import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../components/ToastProvider';
import RecordForm from '../components/RecordForm';
import Items from '../pages/Items';
import Detail from '../pages/Detail';
import { useRemote } from '../hooks/useRecords';
import { listRecords, saveRecord, getRecord, deleteRecord, validateRecord } from '../lib/records';
vi.mock('../lib/records', async importOriginal => ({ ...await importOriginal(), listRecords: vi.fn(), saveRecord: vi.fn(), getRecord: vi.fn(), deleteRecord: vi.fn() }));
const record = { id: '123', title: 'React 상태', content: '상태가 바뀌면 다시 렌더링됩니다.', category: 'React', status: '학습 중', created_at: '2026-09-05T00:00:00Z', updated_at: '2026-09-05T00:00:00Z' };
function mount(element, path = '/') { return render(<MemoryRouter initialEntries={[path]}><ToastProvider><Routes><Route path="/" element={element}/><Route path="/items/:id" element={<Detail/>}/><Route path="/items" element={<Items/>}/></Routes></ToastProvider></MemoryRouter>); }
beforeEach(() => { vi.resetAllMocks(); listRecords.mockResolvedValue([]); getRecord.mockResolvedValue(record); });
describe('폼과 원격 데이터 흐름', () => {
  it('공백 필수값과 길이를 검증한다', () => {
    expect(validateRecord({ ...record, title: ' ', content: ' ' })).toHaveProperty('title');
    expect(validateRecord({ ...record, title: 'x'.repeat(81) })).toHaveProperty('title');
    expect(validateRecord(record)).toEqual({});
  });
  it('빈 폼 제출은 요청 없이 필드 오류를 표시한다', async () => {
    mount(<RecordForm/>); await userEvent.click(screen.getByRole('button', { name: '기록 저장' }));
    expect(screen.getByText('제목을 입력해 주세요.')).toBeVisible();
    expect(screen.getByText('배운 내용을 입력해 주세요.')).toBeVisible();
    expect(saveRecord).not.toHaveBeenCalled();
  });
  it('입력 미리보기, 제출 중 비활성화, 저장 후 상세 이동과 알림', async () => {
    let resolve; saveRecord.mockImplementation(() => new Promise(r => { resolve = r; }));
    mount(<RecordForm/>);
    await userEvent.type(screen.getByLabelText('제목 *'), 'React 상태');
    await userEvent.type(screen.getByLabelText('배운 내용 *'), record.content);
    expect(screen.getByRole('heading', { name: 'React 상태' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: '기록 저장' }));
    expect(screen.getByRole('button', { name: '저장 중…' })).toBeDisabled();
    await act(async () => resolve(record));
    expect(await screen.findByRole('heading', { name: record.title })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('새로운 배움을 기록했어요.');
    expect(saveRecord).toHaveBeenCalledTimes(1);
  });
  it('수정 실패 시 입력을 유지하고 재시도할 수 있다', async () => {
    saveRecord.mockRejectedValue(new Error('네트워크 오류'));
    mount(<RecordForm initial={record}/>);
    await userEvent.click(screen.getByRole('button', { name: '수정 저장' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('네트워크 오류');
    expect(screen.getByLabelText('제목 *')).toHaveValue(record.title);
    expect(screen.getByRole('button', { name: '수정 저장' })).toBeEnabled();
    expect(saveRecord).toHaveBeenCalledWith(expect.objectContaining({ title: record.title }), record.id);
  });
  it('목록 로딩, 검색, 빈 검색 결과와 초기화를 처리한다', async () => {
    listRecords.mockResolvedValue([record]); mount(<Items/>);
    expect(screen.getByRole('status')).toHaveTextContent('불러오는 중');
    expect(await screen.findByRole('heading', { name: record.title })).toBeVisible();
    await userEvent.type(screen.getByLabelText('기록 검색'), '없는 검색어');
    expect(screen.getByText('검색 결과가 없어요')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: '필터 초기화' }));
    expect(screen.getByRole('heading', { name: record.title })).toBeVisible();
    await userEvent.selectOptions(screen.getByLabelText('주제'), 'CSS');
    expect(screen.getByText('검색 결과가 없어요')).toBeVisible();
  });
  it('목록 실패 후 다시 시도하면 빈 상태를 표시한다', async () => {
    listRecords.mockRejectedValueOnce(new Error('연결 실패')).mockResolvedValueOnce([]); mount(<Items/>);
    expect(await screen.findByRole('alert')).toHaveTextContent('연결 실패');
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findByText('아직 기록이 없어요')).toBeVisible();
  });
  it('없는 상세 기록은 빈 상태를 표시한다', async () => {
    getRecord.mockResolvedValue(null); mount(null, '/items/123');
    expect(await screen.findByText('기록을 찾을 수 없어요')).toBeVisible();
  });
  it('삭제 확인 뒤 삭제하고 목록으로 이동한다', async () => {
    deleteRecord.mockResolvedValue({ id: '123' }); mount(null, '/items/123');
    await userEvent.click(await screen.findByRole('button', { name: '삭제하기' }));
    expect(deleteRecord).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: '삭제 확인' }));
    expect(await screen.findByRole('heading', { name: '나의 학습 기록' })).toBeVisible();
    expect(deleteRecord).toHaveBeenCalledWith('123');
  });
  it('삭제 실패는 상세 화면에서 표시한다', async () => {
    deleteRecord.mockRejectedValue(new Error('삭제 실패')); mount(null, '/items/123');
    await userEvent.click(await screen.findByRole('button', { name: '삭제하기' }));
    await userEvent.click(screen.getByRole('button', { name: '삭제 확인' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('삭제 실패');
    expect(screen.getByRole('heading', { name: record.title })).toBeVisible();
  });
  it('이전 요청이 늦게 완료되어도 새 데이터를 덮어쓰지 않는다', async () => {
    let finishOld; const oldLoader = () => new Promise(r => { finishOld = r; });
    const newLoader = () => Promise.resolve('new');
    const { result, rerender } = renderHook(({ loader }) => useRemote(loader), { initialProps: { loader: oldLoader } });
    await waitFor(() => expect(finishOld).toBeTypeOf('function'));
    rerender({ loader: newLoader });
    await waitFor(() => expect(result.current.data).toBe('new'));
    await act(async () => finishOld('old'));
    expect(result.current.data).toBe('new');
  });
});
