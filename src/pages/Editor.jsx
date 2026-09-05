import { Link, useParams } from 'react-router-dom';
import { useRecord } from '../hooks/useRecords';
import RecordForm from '../components/RecordForm';
import { PageHeader, Loading, ErrorState, EmptyState } from '../components/UI';
export function NewRecord() { return <><PageHeader title="오늘의 배움 남기기" description="완벽한 정리보다, 나만의 언어로 기록하는 것이 중요해요."/><RecordForm/></>; }
export function EditRecord() {
  const { id } = useParams(); const { data, loading, error, retry } = useRecord(id);
  if (loading) return <Loading/>; if (error) return <ErrorState error={error} onRetry={retry}/>;
  if (!data) return <EmptyState title="기록을 찾을 수 없어요" description="삭제되었거나 접근할 수 없는 기록입니다." action={<Link to="/items">목록으로</Link>}/>;
  return <><PageHeader title="배움 다듬기" description="새롭게 이해한 내용을 더해보세요."/><RecordForm key={id} initial={data}/></>;
}
