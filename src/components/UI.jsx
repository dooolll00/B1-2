import { Link } from 'react-router-dom';
export function Button({ children, variant = 'primary', ...props }) {
  return (
    <button className={`button ${variant}`} {...props}>
      {children}
    </button>
  );
}
export function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function Badge({ children }) {
  return <span className="badge">{children}</span>;
}
export function PageHeader({
  eyebrow = 'LEARNING JOURNAL',
  title,
  description,
  action,
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action}
    </header>
  );
}
export function Loading({ label = '기록을 불러오는 중입니다…' }) {
  return (
    <div className="state" role="status">
      <span className="spinner" />
      {label}
    </div>
  );
}
export function ErrorState({ error, onRetry }) {
  return (
    <div className="state error" role="alert">
      <h2>요청을 완료하지 못했어요</h2>
      <p>{error?.message || '연결 상태를 확인하고 다시 시도해 주세요.'}</p>
      {onRetry && <Button onClick={onRetry}>다시 시도</Button>}
      <Link to="/guide">연결 및 이용 안내</Link>
    </div>
  );
}
export function EmptyState({
  title = '아직 기록이 없어요',
  description = '오늘 배운 작은 것부터 기록해 보세요.',
  action,
}) {
  return (
    <div className="state">
      <span className="empty-icon">✎</span>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {action}
    </div>
  );
}
export function Field({ label, name, error, as: Tag = 'input', ...props }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <Tag
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && (
        <small className="field-error" id={`${name}-error`}>
          {error}
        </small>
      )}
    </div>
  );
}
export function StatCard({ label, value, hint }) {
  return (
    <Card className="stat">
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{hint}</small>
    </Card>
  );
}
export function RecordCard({ record }) {
  return (
    <Link className="record-link" to={`/items/${record.id}`}>
      <Card>
        <div className="row">
          <Badge>{record.category}</Badge>
          <small>{record.status}</small>
        </div>
        <h2>{record.title}</h2>
        <p className="excerpt">{record.content}</p>
        <div className="row muted">
          <small>
            {new Date(record.created_at).toLocaleDateString('ko-KR')}
          </small>
          <span aria-hidden="true">↗</span>
        </div>
      </Card>
    </Link>
  );
}
export function RecordList({ records }) {
  return (
    <div className="record-grid">
      {records.map((record) => (
        <RecordCard key={record.id} record={record} />
      ))}
    </div>
  );
}
