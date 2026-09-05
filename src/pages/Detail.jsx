import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRecord } from '../hooks/useRecords';
import { deleteRecord } from '../lib/records';
import { useToast } from '../components/ToastProvider';
import { Loading, ErrorState, EmptyState, Badge, Card, Button } from '../components/UI';
export default function Detail() {
  const { id } = useParams(); const { data, loading, error, retry } = useRecord(id);
  const [confirm, setConfirm] = useState(false); const [pending, setPending] = useState(false); const [failure, setFailure] = useState(null);
  const lock = useRef(false); const navigate = useNavigate(); const notify = useToast();
  async function remove() { if (lock.current) return; lock.current = true; setPending(true); setFailure(null); try { await deleteRecord(id); notify('기록을 삭제했어요.'); navigate('/items'); } catch (err) { setFailure(err); } finally { lock.current = false; setPending(false); } }
  if (loading) return <Loading/>; if (error) return <ErrorState error={error} onRetry={retry}/>;
  if (!data) return <EmptyState title="기록을 찾을 수 없어요" description="삭제되었거나 접근할 수 없는 기록입니다." action={<Link to="/items">목록으로 돌아가기</Link>}/>;
  return <><Link to="/items" className="back">← 학습 기록</Link><article className="detail"><div className="row"><Badge>{data.category}</Badge><span>{data.status}</span></div><h1>{data.title}</h1><p className="muted">작성 {new Date(data.created_at).toLocaleString('ko-KR')} · 수정 {new Date(data.updated_at).toLocaleString('ko-KR')}</p><Card><div className="body-text">{data.content}</div></Card><div className="actions"><Link className="button" to={`/items/${id}/edit`}>수정하기</Link><Button variant="danger" onClick={() => setConfirm(true)}>삭제하기</Button></div>{confirm && <Card><h2>이 기록을 삭제할까요?</h2><p>삭제한 기록은 복원할 수 없습니다.</p><div className="actions"><Button variant="danger" disabled={pending} onClick={remove}>{pending ? '삭제 중…' : '삭제 확인'}</Button><Button variant="secondary" disabled={pending} onClick={() => setConfirm(false)}>취소</Button></div></Card>}{failure && <ErrorState error={failure}/>}</article></>;
}
