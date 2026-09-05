import { Link, useParams, useNavigate } from 'react-router-dom';
import { useRecord } from '../hooks/useRecords';
import { saveRecord } from '../lib/records';
import { useToast } from '../components/ToastProvider';
import RecordForm from '../components/RecordForm';
import { PageHeader, Loading, ErrorState, EmptyState } from '../components/UI';
export function NewRecord() {
  const navigate = useNavigate();
  const notify = useToast();
  async function handleCreate(values) {
    const saved = await saveRecord(values);
    notify('새로운 배움을 기록했어요.');
    navigate(`/items/${saved.id}`);
  }
  return (
    <>
      <PageHeader
        title="오늘의 배움 남기기"
        description="완벽한 정리보다, 나만의 언어로 기록하는 것이 중요해요."
      />
      <RecordForm onSubmit={handleCreate} />
    </>
  );
}
export function EditRecord() {
  const navigate = useNavigate();
  const notify = useToast();
  const { id } = useParams();
  const { data, loading, error, retry } = useRecord(id);
  async function handleUpdate(values) {
    const saved = await saveRecord(values, id);
    notify('기록을 수정했어요.');
    navigate(`/items/${saved.id}`);
  }
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (!data)
    return (
      <EmptyState
        title="기록을 찾을 수 없어요"
        description="삭제되었거나 접근할 수 없는 기록입니다."
        action={<Link to="/items">목록으로</Link>}
      />
    );
  return (
    <>
      <PageHeader
        title="배움 다듬기"
        description="새롭게 이해한 내용을 더해보세요."
      />
      <RecordForm
        key={id}
        initial={data}
        onSubmit={handleUpdate}
        cancelTo={`/items/${id}`}
        submitLabel="수정 저장"
      />
    </>
  );
}
