import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categories, statuses, validateRecord, saveRecord } from '../lib/records';
import { Button, Card, Field, Badge, ErrorState } from './UI';
import { useToast } from './ToastProvider';
export default function RecordForm({ initial }) {
  const [values, setValues] = useState(initial ? { title: initial.title, content: initial.content, category: initial.category, status: initial.status } : { title: '', content: '', category: 'React', status: '학습 중' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  const navigate = useNavigate();
  const notify = useToast();
  function change(event) { const { name, value } = event.target; setValues(v => ({ ...v, [name]: value })); setErrors(e => ({ ...e, [name]: undefined })); }
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const next = validateRecord(values); setErrors(next);
    if (Object.keys(next).length) { document.getElementById(Object.keys(next)[0])?.focus(); return; }
    lock.current = true; setPending(true); setError(null);
    try { const saved = await saveRecord(values, initial?.id); notify(initial ? '기록을 수정했어요.' : '새로운 배움을 기록했어요.'); navigate(`/items/${saved.id}`); }
    catch (err) { setError(err); }
    finally { lock.current = false; setPending(false); }
  }
  return <div className="form-layout"><Card><form onSubmit={submit} noValidate><fieldset disabled={pending}><Field label="제목 *" name="title" value={values.title} onChange={change} error={errors.title} maxLength={80} placeholder="오늘 무엇을 배웠나요?" required/><div className="form-row"><Field as="select" label="주제" name="category" value={values.category} onChange={change} error={errors.category}>{categories.map(x => <option key={x}>{x}</option>)}</Field><Field as="select" label="학습 상태" name="status" value={values.status} onChange={change} error={errors.status}>{statuses.map(x => <option key={x}>{x}</option>)}</Field></div><Field as="textarea" label="배운 내용 *" name="content" value={values.content} onChange={change} error={errors.content} rows={12} maxLength={10000} placeholder="핵심 개념, 직접 해본 것, 다음에 더 알아볼 것을 적어 보세요." required/><p className="muted counter">{values.content.length.toLocaleString()} / 10,000</p><div className="actions"><Button type="submit" disabled={pending}>{pending ? '저장 중…' : initial ? '수정 저장' : '기록 저장'}</Button>{!pending && <Link to={initial ? `/items/${initial.id}` : '/items'}>취소</Link>}</div></fieldset>{error && <ErrorState error={error}/>}</form></Card><aside><p className="eyebrow">LIVE PREVIEW</p><Card><Badge>{values.category}</Badge><h2>{values.title || '오늘의 배움 제목'}</h2><p className="body-text">{values.content || '입력한 내용이 여기에 바로 표시됩니다.'}</p><small className="muted">{values.status}</small></Card></aside></div>;
}
