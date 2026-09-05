import { Link } from 'react-router-dom';
import { configured } from '../lib/supabase';
import { PageHeader, Card, Badge } from '../components/UI';
export default function Guide() {
  return (
    <>
      <PageHeader
        title="작은 기록, 꾸준한 성장"
        description="오늘의 배움을 이렇게 활용해 보세요."
      />
      <div className="guide-grid">
        {[
          [
            '01',
            '오늘 배운 것 기록하기',
            '제목과 내용을 적고 주제와 학습 상태를 선택하세요. 입력한 내용은 미리보기로 확인할 수 있어요.',
          ],
          [
            '02',
            '필요한 배움 찾기',
            '학습 기록에서 제목과 내용을 검색하거나 주제·상태별로 모아보세요.',
          ],
          [
            '03',
            '복습하고 업데이트하기',
            '상세 화면에서 기록을 수정하고 학습 완료로 바꿔보세요. 필요 없는 기록은 삭제할 수 있어요.',
          ],
        ].map(([n, t, d]) => (
          <Card key={n}>
            <Badge>{n}</Badge>
            <h2>{t}</h2>
            <p>{d}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2>내 기록은 어디에 저장되나요?</h2>
        <p>
          기록은 Supabase 원격 데이터베이스에 저장됩니다. 첫 접속 시 익명 계정이
          만들어지며, 같은 브라우저에 저장된 세션으로 내 기록에 접근합니다.
          브라우저 데이터를 삭제하거나 다른 기기를 사용하면 기존 기록에 접근할
          수 없으니 주의해 주세요.
        </p>
        <p>
          연결 설정:{' '}
          <strong>
            {configured
              ? '환경변수 등록됨 (실제 연결은 목록에서 확인)'
              : '설정 필요'}
          </strong>
        </p>
        {!configured && (
          <p>
            프로젝트의 README에 따라 Supabase 테이블을 생성하고 익명 로그인을
            활성화한 뒤 환경변수를 등록해 주세요. 배포 시에도 환경변수를
            등록하고 다시 배포해야 합니다.
          </p>
        )}
        <Link to="/items">학습 기록 열기 →</Link>
      </Card>
    </>
  );
}
