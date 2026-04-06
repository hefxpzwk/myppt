import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PresentationPage } from './pages/presentation/PresentationPage';
import { sanitizePresentationId } from './utils/presentation';

function getPathname(): string {
  return window.location.pathname;
}

function renderByPath(pathname: string) {
  if (pathname === '/') {
    return <DashboardPage />;
  }

  if (pathname.startsWith('/presentation/')) {
    const rawId = pathname.slice('/presentation/'.length);
    const presentationId = sanitizePresentationId(rawId);

    if (!presentationId) {
      return <PresentationPage presentationId="__invalid__" />;
    }

    return <PresentationPage presentationId={presentationId} />;
  }

  return (
    <main className="app-shell">
      <h1>Page Not Found</h1>
      <p>요청한 경로를 찾을 수 없습니다.</p>
      <a className="button" href="/">
        Go To Dashboard
      </a>
    </main>
  );
}

function App() {
  return renderByPath(getPathname());
}

export default App;
