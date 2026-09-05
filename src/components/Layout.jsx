import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus();
  }, [pathname]);
  return (
    <>
      <a className="skip" href="#main">
        본문 바로가기
      </a>
      <header className="site-header">
        <Link to="/" className="brand">
          <span>배</span>오늘의 배움<small>daily learning</small>
        </Link>
        <nav aria-label="주요 메뉴">
          <NavLink to="/" end>
            대시보드
          </NavLink>
          <NavLink to="/items">학습 기록</NavLink>
          <NavLink to="/guide">이용 안내</NavLink>
        </nav>
        <Link to="/items/new" className="button">
          + 새 기록
        </Link>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer>
        오늘의 작은 배움이 내일의 나를 만듭니다.<span>React × Supabase</span>
      </footer>
    </>
  );
}
