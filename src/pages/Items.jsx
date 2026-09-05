import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecords } from '../hooks/useRecords';
import { categories, statuses } from '../lib/records';
import { PageHeader, Field, Loading, ErrorState, EmptyState, RecordList, Button } from '../components/UI';
export default function Items() {
  const { data, loading, error, retry } = useRecords();
  const [search, setSearch] = useState(''); const [category, setCategory] = useState('전체'); const [status, setStatus] = useState('전체');
  const filtered = useMemo(() => (data || []).filter(x => (category === '전체' || x.category === category) && (status === '전체' || x.status === status) && `${x.title} ${x.content}`.toLowerCase().includes(search.trim().toLowerCase())), [data, category, status, search]);
  return <><PageHeader title="나의 학습 기록" description="하루하루 쌓아온 배움을 한곳에서 만나보세요." action={<Link className="button" to="/items/new">+ 새 기록</Link>}/><div className="filters"><Field label="기록 검색" name="search" type="search" placeholder="제목이나 내용으로 검색" value={search} onChange={e => setSearch(e.target.value)}/><Field as="select" label="주제" name="category" value={category} onChange={e => setCategory(e.target.value)}>{['전체', ...categories].map(x => <option key={x}>{x}</option>)}</Field><Field as="select" label="학습 상태" name="status" value={status} onChange={e => setStatus(e.target.value)}>{['전체', ...statuses].map(x => <option key={x}>{x}</option>)}</Field></div>{loading ? <Loading/> : error ? <ErrorState error={error} onRetry={retry}/> : <><p className="muted" role="status">총 {filtered.length}개의 기록</p>{filtered.length ? <RecordList records={filtered}/> : data.length ? <EmptyState title="검색 결과가 없어요" description="다른 검색어나 필터로 찾아보세요." action={<Button onClick={() => { setSearch(''); setCategory('전체'); setStatus('전체'); }}>필터 초기화</Button>}/> : <EmptyState action={<Link className="button" to="/items/new">첫 기록 남기기</Link>}/>}</>}</>;
}
