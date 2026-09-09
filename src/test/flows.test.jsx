import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  render,
  screen,
  waitFor,
  renderHook,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import App from '../App';
import { ToastProvider } from '../components/ToastProvider';
import { NewRecord, EditRecord } from '../pages/Editor';
import Items from '../pages/Items';
import Detail from '../pages/Detail';
import { useRemote } from '../hooks/useRecords';
import {
  listRecords,
  saveRecord,
  getRecord,
  deleteRecord,
  validateRecord,
} from '../lib/records';
vi.mock('../lib/records', async (importOriginal) => ({
  ...(await importOriginal()),
  listRecords: vi.fn(),
  saveRecord: vi.fn(),
  getRecord: vi.fn(),
  deleteRecord: vi.fn(),
}));
const record = {
  id: '123',
  title: 'React 상태',
  content: '상태가 바뀌면 다시 렌더링됩니다.',
  category: 'React',
  status: '학습 중',
  created_at: '2026-09-05T00:00:00Z',
  updated_at: '2026-09-05T00:00:00Z',
};
function mount(element, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <Routes>
          <Route path="/" element={element} />
          <Route path="/items/:id" element={<Detail />} />
          <Route path="/items/:id/edit" element={<EditRecord />} />
          <Route path="/items" element={<Items />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  vi.resetAllMocks();
  listRecords.mockResolvedValue([]);
  getRecord.mockResolvedValue(record);
});
describe('폼과 원격 데이터 흐름', () => {
  it('공백 필수값과 길이를 검증한다', () => {
    expect(
      validateRecord({ ...record, title: ' ', content: ' ' }),
    ).toHaveProperty('title');
    expect(validateRecord({ ...record, title: 'x'.repeat(81) })).toHaveProperty(
      'title',
    );
    expect(validateRecord(record)).toEqual({});
  });
  it('빈 폼 제출은 요청 없이 필드 오류를 표시한다', async () => {
    mount(<NewRecord />);
    await userEvent.click(screen.getByRole('button', { name: '기록 저장' }));
    expect(screen.getByText('제목을 입력해 주세요.')).toBeVisible();
    expect(screen.getByText('배운 내용을 입력해 주세요.')).toBeVisible();
    expect(saveRecord).not.toHaveBeenCalled();
  });
  it('입력 미리보기, 제출 중 비활성화, 저장 후 상세 이동과 알림', async () => {
    let resolve;
    saveRecord.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    mount(<NewRecord />);
    await userEvent.type(screen.getByLabelText('제목 *'), 'React 상태');
    await userEvent.type(screen.getByLabelText('배운 내용 *'), record.content);
    expect(screen.getByRole('heading', { name: 'React 상태' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: '기록 저장' }));
    expect(screen.getByRole('button', { name: '저장 중…' })).toBeDisabled();
    await act(async () => resolve(record));
    expect(
      await screen.findByRole('heading', { name: record.title }),
    ).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      '새로운 배움을 기록했어요.',
    );
    expect(saveRecord).toHaveBeenCalledTimes(1);
  });
  it('수정 실패 시 입력을 유지하고 재시도할 수 있다', async () => {
    saveRecord.mockRejectedValue(new Error('네트워크 오류'));
    mount(null, '/items/123/edit');
    await userEvent.click(
      await screen.findByRole('button', { name: '수정 저장' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('네트워크 오류');
    expect(screen.getByLabelText('제목 *')).toHaveValue(record.title);
    expect(screen.getByRole('button', { name: '수정 저장' })).toBeEnabled();
    expect(saveRecord).toHaveBeenCalledWith(
      expect.objectContaining({ title: record.title }),
      record.id,
    );
  });
  it('목록 로딩, 검색, 빈 검색 결과와 초기화를 처리한다', async () => {
    listRecords.mockResolvedValue([record]);
    mount(<Items />);
    expect(screen.getByRole('status')).toHaveTextContent('불러오는 중');
    expect(
      await screen.findByRole('heading', { name: record.title }),
    ).toBeVisible();
    await userEvent.type(screen.getByLabelText('기록 검색'), '없는 검색어');
    expect(screen.getByText('검색 결과가 없어요')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: '필터 초기화' }));
    expect(screen.getByRole('heading', { name: record.title })).toBeVisible();
    await userEvent.selectOptions(screen.getByLabelText('주제'), 'CSS');
    expect(screen.getByText('검색 결과가 없어요')).toBeVisible();
  });
  it('목록 실패 후 다시 시도하면 빈 상태를 표시한다', async () => {
    listRecords
      .mockRejectedValueOnce(new Error('연결 실패'))
      .mockResolvedValueOnce([]);
    mount(<Items />);
    expect(await screen.findByRole('alert')).toHaveTextContent('연결 실패');
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findByText('아직 기록이 없어요')).toBeVisible();
  });
  it('없는 상세 기록은 빈 상태를 표시한다', async () => {
    getRecord.mockResolvedValue(null);
    mount(null, '/items/123');
    expect(await screen.findByText('기록을 찾을 수 없어요')).toBeVisible();
  });
  it('삭제 확인 뒤 삭제하고 목록으로 이동한다', async () => {
    deleteRecord.mockResolvedValue({ id: '123' });
    mount(null, '/items/123');
    await userEvent.click(
      await screen.findByRole('button', { name: '삭제하기' }),
    );
    expect(deleteRecord).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: '삭제 확인' }));
    expect(
      await screen.findByRole('heading', { name: '나의 학습 기록' }),
    ).toBeVisible();
    expect(deleteRecord).toHaveBeenCalledWith('123');
  });
  it('삭제 실패는 상세 화면에서 표시한다', async () => {
    deleteRecord.mockRejectedValue(new Error('삭제 실패'));
    mount(null, '/items/123');
    await userEvent.click(
      await screen.findByRole('button', { name: '삭제하기' }),
    );
    await userEvent.click(screen.getByRole('button', { name: '삭제 확인' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('삭제 실패');
    expect(screen.getByRole('heading', { name: record.title })).toBeVisible();
  });
  it('이전 요청이 늦게 완료되어도 새 데이터를 덮어쓰지 않는다', async () => {
    let finishOld;
    const oldLoader = () =>
      new Promise((r) => {
        finishOld = r;
      });
    const newLoader = () => Promise.resolve('new');
    const { result, rerender } = renderHook(({ loader }) => useRemote(loader), {
      initialProps: { loader: oldLoader },
    });
    await waitFor(() => expect(finishOld).toBeTypeOf('function'));
    rerender({ loader: newLoader });
    await waitFor(() => expect(result.current.data).toBe('new'));
    await act(async () => finishOld('old'));
    expect(result.current.data).toBe('new');
  });

  it('조회 대상이 바뀐 첫 렌더부터 이전 데이터를 숨긴다', async () => {
    const oldLoader = () => Promise.resolve('old');
    const newLoader = () => new Promise(() => {});
    const renders = [];
    const { result, rerender } = renderHook(
      ({ loader }) => {
        const state = useRemote(loader);
        renders.push({ loader, ...state });
        return state;
      },
      { initialProps: { loader: oldLoader } },
    );
    await waitFor(() => expect(result.current.data).toBe('old'));
    rerender({ loader: newLoader });
    const firstNewRender = renders.find((entry) => entry.loader === newLoader);
    expect(firstNewRender).toMatchObject({
      data: null,
      loading: true,
      error: null,
    });
  });

  it('다른 기록으로 이동하면 삭제 확인과 오류를 초기화한다', async () => {
    getRecord.mockImplementation(async (id) => ({
      ...record,
      id,
      title: `기록 ${id}`,
    }));
    deleteRecord.mockRejectedValue(new Error('삭제 실패'));
    render(
      <MemoryRouter initialEntries={['/items/123']}>
        <ToastProvider>
          <Link to="/items/456">다른 기록</Link>
          <Routes>
            <Route path="/items/:id" element={<Detail />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>,
    );
    await userEvent.click(
      await screen.findByRole('button', { name: '삭제하기' }),
    );
    await userEvent.click(screen.getByRole('button', { name: '삭제 확인' }));
    await screen.findByRole('alert');
    await userEvent.click(screen.getByRole('link', { name: '다른 기록' }));
    await screen.findByRole('heading', { name: '기록 456' });
    expect(
      screen.queryByRole('button', { name: '삭제 확인' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('삭제 실패 후 취소하면 오류를 지우고 다시 시도할 수 있다', async () => {
    deleteRecord
      .mockRejectedValueOnce(new Error('삭제 실패'))
      .mockResolvedValueOnce({ id: '123' });
    mount(null, '/items/123');
    await userEvent.click(
      await screen.findByRole('button', { name: '삭제하기' }),
    );
    await userEvent.click(screen.getByRole('button', { name: '삭제 확인' }));
    await screen.findByRole('alert');
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '삭제하기' }));
    await userEvent.click(screen.getByRole('button', { name: '삭제 확인' }));
    expect(
      await screen.findByRole('heading', { name: '나의 학습 기록' }),
    ).toBeVisible();
  });
});

describe('실제 앱 라우트와 추가 미션 흐름', () => {
  function mountApp(path) {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    return render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
  }

  it.each([
    ['/', '배움을 기록하고,'],
    ['/items', '나의 학습 기록'],
    ['/items/new', '오늘의 배움 남기기'],
    ['/items/123', record.title],
    ['/items/123/edit', '배움 다듬기'],
    ['/guide', '작은 기록, 꾸준한 성장'],
    ['/unknown', '404 · 페이지를 찾을 수 없어요'],
  ])(
    '%s 직접 진입 시 화면과 공통 네비게이션을 표시한다',
    async (path, title) => {
      mountApp(path);
      expect(
        await screen.findByRole('heading', { name: new RegExp(title) }),
      ).toBeVisible();
      expect(
        screen.getByRole('navigation', { name: '주요 메뉴' }),
      ).toBeVisible();
    },
  );

  it('수정한 값을 저장하고 상세에서 다시 조회한다', async () => {
    const updated = { ...record, title: '수정한 제목', status: '학습 완료' };
    getRecord.mockResolvedValueOnce(record).mockResolvedValue(updated);
    saveRecord.mockResolvedValue(updated);
    mountApp('/items/123/edit');
    const title = await screen.findByLabelText('제목 *');
    expect(title).toHaveValue(record.title);
    await userEvent.clear(title);
    await userEvent.type(title, updated.title);
    await userEvent.selectOptions(
      screen.getByLabelText('학습 상태'),
      updated.status,
    );
    await userEvent.click(screen.getByRole('button', { name: '수정 저장' }));
    expect(
      await screen.findByRole('heading', { name: updated.title, level: 1 }),
    ).toBeVisible();
    expect(saveRecord).toHaveBeenCalledWith(
      expect.objectContaining({ title: updated.title, status: updated.status }),
      record.id,
    );
    expect(getRecord).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('status')).toHaveTextContent('기록을 수정했어요.');
  });

  it('삭제를 취소하면 요청하지 않고 상세를 유지한다', async () => {
    mountApp('/items/123');
    await userEvent.click(
      await screen.findByRole('button', { name: '삭제하기' }),
    );
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(
      screen.queryByRole('button', { name: '삭제 확인' }),
    ).not.toBeInTheDocument();
    expect(deleteRecord).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: record.title })).toBeVisible();
  });

  it('검색·주제·상태 조건을 함께 적용한다', async () => {
    listRecords.mockResolvedValue([
      record,
      {
        ...record,
        id: '456',
        title: 'CSS 레이아웃',
        category: 'CSS',
        status: '학습 완료',
      },
    ]);
    mountApp('/items');
    await screen.findByRole('heading', { name: record.title });
    await userEvent.selectOptions(
      screen.getByLabelText('학습 상태'),
      '학습 완료',
    );
    expect(
      screen.queryByRole('heading', { name: record.title }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CSS 레이아웃' })).toBeVisible();
    await userEvent.selectOptions(screen.getByLabelText('주제'), 'React');
    expect(screen.getByText('검색 결과가 없어요')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: '필터 초기화' }));
    await userEvent.type(screen.getByLabelText('기록 검색'), '상태가 바뀌면');
    expect(screen.getByRole('heading', { name: record.title })).toBeVisible();
    expect(screen.getByLabelText('학습 상태')).toHaveValue('전체');
  });

  it.each(['/items/123', '/items/123/edit'])(
    '%s 조회 실패 후 재시도할 수 있다',
    async (path) => {
      getRecord
        .mockRejectedValueOnce(new Error('조회 실패'))
        .mockResolvedValue(record);
      mountApp(path);
      expect(await screen.findByRole('alert')).toHaveTextContent('조회 실패');
      await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
      expect(
        await screen.findByRole('heading', {
          name: path.endsWith('/edit') ? '배움 다듬기' : record.title,
        }),
      ).toBeVisible();
    },
  );

  it('없는 수정 데이터는 빈 상태로 안내한다', async () => {
    getRecord.mockResolvedValue(null);
    mountApp('/items/123/edit');
    expect(await screen.findByText('기록을 찾을 수 없어요')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: '수정 저장' }),
    ).not.toBeInTheDocument();
  });
});
