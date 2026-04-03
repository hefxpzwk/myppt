import { TopBar } from '../../components/TopBar';
import { getPresentationById } from '../../utils/presentation';

interface PresentationPageProps {
  presentationId: string;
}

export function PresentationPage({ presentationId }: PresentationPageProps) {
  const presentation = getPresentationById(presentationId);

  if (!presentation) {
    return (
      <main className="app-shell">
        <TopBar
          title="Presentation Not Found"
          subtitle="유효하지 않은 발표 ID입니다. 대시보드에서 다시 선택해 주세요."
          action={<a className="button button--ghost" href="/">Back To Dashboard</a>}
        />
      </main>
    );
  }

  return (
    <main className="viewer-shell">
      <TopBar
        title={presentation.title}
        subtitle={presentation.description}
        action={<a className="button button--ghost" href="/">Back To Dashboard</a>}
      />
      <section className="viewer-frame-wrap">
        <iframe
          className="viewer-frame"
          src={presentation.path}
          title={presentation.title}
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      </section>
    </main>
  );
}
