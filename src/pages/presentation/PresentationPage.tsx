import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../../components/TopBar';
import { getPresentationById } from '../../utils/presentation';

interface PresentationPageProps {
  presentationId: string;
}

export function PresentationPage({ presentationId }: PresentationPageProps) {
  const viewerFrameWrapRef = useRef<HTMLElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const presentation = getPresentationById(presentationId);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerFrameWrapRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    if (!viewerFrameWrapRef.current) {
      return;
    }

    try {
      if (document.fullscreenElement === viewerFrameWrapRef.current) {
        await document.exitFullscreen();
        return;
      }

      await viewerFrameWrapRef.current.requestFullscreen();
    } catch {
      // Fullscreen requests may fail due to browser permissions or policy.
    }
  };

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
        action={
          <div className="viewer-actions">
            <button
              className="button button--icon"
              type="button"
              onClick={handleToggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <span aria-hidden="true">{isFullscreen ? '⤡' : '⤢'}</span>
            </button>
            <a className="button button--ghost" href="/">
              Back To Dashboard
            </a>
          </div>
        }
      />
      <section className="viewer-frame-wrap" ref={viewerFrameWrapRef}>
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
