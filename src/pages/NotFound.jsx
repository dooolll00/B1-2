import { Link } from 'react-router-dom';
import { EmptyState } from '../components/UI';
export default function NotFound() { return <EmptyState title="404 · 페이지를 찾을 수 없어요" description="주소를 확인하거나 대시보드로 돌아가 주세요." action={<Link to="/" className="button">대시보드로</Link>}/>; }
