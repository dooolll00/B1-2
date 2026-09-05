import { Link } from 'react-router-dom';
import { useRecords } from '../hooks/useRecords';
import { PageHeader, Loading, ErrorState, EmptyState, RecordList, StatCard } from '../components/UI';
export default function Home() {
  const { data, loading, error, retry } = useRecords();
  return <><section className="hero"><div><p className="eyebrow">ONE DAY, ONE DISCOVERY</p><h1>배움을 기록하고,<br/>성장을 발견하세요.</h1><p>오늘 이해한 개념 하나, 해결한 문제 하나.<br/>흩어진 배움을 나만의 기록으로 모아보세요.</p><Link className="button" to="/items/new">오늘의 배움 기록하기 ↗</Link></div><div className="hero-art" aria-hidden="true"><span>작은 기록</span><strong>차곡<br/>차곡.</strong><span>더 단단해지는 나 🌱</span></div></section>{loading ? <Loading/> : error ? <ErrorState error={error} onRetry={retry}/> : <><div className="stats"><StatCard label="전체 기록" value={data.length} hint="쌓여가는 배움"/><StatCard label="학습 완료" value={data.filter(x => x.status === '학습 완료').length} hint="내 것으로 만든 개념"/><StatCard label="복습 필요" value={data.filter(x => x.status === '복습 필요').length} hint="다시 만나볼 배움"/></div><PageHeader eyebrow="RECENT NOTES" title="최근의 배움" description="기록을 돌아보며 한 걸음 더 나아가요." action={<Link to="/items">전체 보기 →</Link>}/>{data.length ? <RecordList records={data.slice(0, 3)}/> : <EmptyState action={<Link to="/items/new" className="button">첫 기록 남기기</Link>}/>}</>}</>;
}
