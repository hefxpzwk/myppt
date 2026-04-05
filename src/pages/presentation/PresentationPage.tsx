import { useCallback, useEffect, useRef, useState } from 'react';
import { TopBar } from '../../components/TopBar';
import { getPresentationById } from '../../utils/presentation';

interface PresentationPageProps {
  presentationId: string;
}

type AnnotationTool = 'none' | 'pen' | 'highlight' | 'pointer' | 'erase';

interface AnnotationPoint {
  x: number;
  y: number;
}

interface AnnotationStroke {
  tool: 'pen' | 'highlight';
  points: AnnotationPoint[];
}

const ANNOTATION_TOOL_LABELS: Record<AnnotationTool, string> = {
  none: '조작',
  pen: '펜',
  highlight: '하이라이트',
  pointer: '포인터',
  erase: '부분 지우기'
};

const ANNOTATION_TOOL_ICONS: Record<AnnotationTool, string> = {
  none: '✋',
  pen: '✎',
  highlight: '▇',
  pointer: '•',
  erase: '⌫'
};

const PARTIAL_ERASE_RADIUS = 0.02;
const MIN_STROKE_POINTS = 2;

function clampPointValue(value: number) {
  return Math.min(1, Math.max(0, value));
}

function getDistanceSquared(a: AnnotationPoint, b: AnnotationPoint) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function erasePointFromStroke(stroke: AnnotationStroke, erasePoint: AnnotationPoint): AnnotationStroke[] {
  const nextSegments: AnnotationStroke[] = [];
  let currentSegment: AnnotationPoint[] = [];
  const radiusSquared = PARTIAL_ERASE_RADIUS * PARTIAL_ERASE_RADIUS;

  for (const point of stroke.points) {
    const shouldErasePoint = getDistanceSquared(point, erasePoint) <= radiusSquared;

    if (shouldErasePoint) {
      if (currentSegment.length >= MIN_STROKE_POINTS) {
        nextSegments.push({
          tool: stroke.tool,
          points: currentSegment
        });
      }

      currentSegment = [];
      continue;
    }

    currentSegment.push(point);
  }

  if (currentSegment.length >= MIN_STROKE_POINTS) {
    nextSegments.push({
      tool: stroke.tool,
      points: currentSegment
    });
  }

  return nextSegments;
}

export function PresentationPage({ presentationId }: PresentationPageProps) {
  const viewerFrameWrapRef = useRef<HTMLElement | null>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const strokesRef = useRef<AnnotationStroke[]>([]);
  const [tool, setTool] = useState<AnnotationTool>('none');
  const [strokes, setStrokes] = useState<AnnotationStroke[]>([]);
  const [pointerPoint, setPointerPoint] = useState<AnnotationPoint | null>(null);
  const presentation = getPresentationById(presentationId);

  const redrawAnnotationCanvas = useCallback(() => {
    const canvas = annotationCanvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);

    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) {
        continue;
      }

      context.beginPath();
      context.lineCap = 'round';
      context.lineJoin = 'round';

      if (stroke.tool === 'highlight') {
        context.strokeStyle = 'rgba(251, 211, 41, 0.56)';
        context.lineWidth = 18;
      } else {
        context.strokeStyle = '#f25f5c';
        context.lineWidth = 4;
      }

      const [firstPoint, ...nextPoints] = stroke.points;
      context.moveTo(firstPoint.x * width, firstPoint.y * height);

      for (const point of nextPoints) {
        context.lineTo(point.x * width, point.y * height);
      }

      context.stroke();
    }
  }, []);

  const fitAnnotationCanvas = useCallback(() => {
    const frameWrap = viewerFrameWrapRef.current;
    const canvas = annotationCanvasRef.current;

    if (!frameWrap || !canvas) {
      return;
    }

    const frameRect = frameWrap.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const pixelWidth = Math.max(1, Math.round(frameRect.width * devicePixelRatio));
    const pixelHeight = Math.max(1, Math.round(frameRect.height * devicePixelRatio));
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    canvas.style.width = `${frameRect.width}px`;
    canvas.style.height = `${frameRect.height}px`;

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    redrawAnnotationCanvas();
  }, [redrawAnnotationCanvas]);

  useEffect(() => {
    strokesRef.current = strokes;
    redrawAnnotationCanvas();
  }, [redrawAnnotationCanvas, strokes]);

  useEffect(() => {
    const frameWrap = viewerFrameWrapRef.current;
    if (!frameWrap) {
      return;
    }

    fitAnnotationCanvas();

    const resizeObserver = new ResizeObserver(() => {
      fitAnnotationCanvas();
    });
    resizeObserver.observe(frameWrap);

    window.addEventListener('resize', fitAnnotationCanvas);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', fitAnnotationCanvas);
    };
  }, [fitAnnotationCanvas]);

  useEffect(() => {
    if (tool !== 'pointer') {
      setPointerPoint(null);
    }
  }, [tool]);

  const handleToggleFullscreen = async () => {
    if (!viewerFrameWrapRef.current) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        return;
      }

      await viewerFrameWrapRef.current.requestFullscreen();
    } catch {
      // Fullscreen requests may fail due to browser permissions or policy.
    }
  };

  const getPointFromEvent = (
    event: React.PointerEvent<HTMLCanvasElement>
  ): AnnotationPoint | null => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    const x = clampPointValue((event.clientX - rect.left) / rect.width);
    const y = clampPointValue((event.clientY - rect.top) / rect.height);

    return { x, y };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'none') {
      return;
    }

    const point = getPointFromEvent(event);
    if (!point) {
      return;
    }

    if (tool === 'pointer') {
      setPointerPoint(point);
      return;
    }

    if (tool === 'erase') {
      event.currentTarget.setPointerCapture(event.pointerId);
      isDrawingRef.current = true;
      setStrokes((previousStrokes) =>
        previousStrokes.flatMap((stroke) => erasePointFromStroke(stroke, point))
      );
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    setStrokes((previousStrokes) => [
      ...previousStrokes,
      {
        tool,
        points: [point]
      }
    ]);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'none') {
      return;
    }

    const point = getPointFromEvent(event);
    if (!point) {
      return;
    }

    if (tool === 'pointer') {
      setPointerPoint(point);
      return;
    }

    if (tool === 'erase') {
      if (!isDrawingRef.current) {
        return;
      }

      setStrokes((previousStrokes) =>
        previousStrokes.flatMap((stroke) => erasePointFromStroke(stroke, point))
      );
      return;
    }

    if (!isDrawingRef.current) {
      return;
    }

    setStrokes((previousStrokes) => {
      if (previousStrokes.length === 0) {
        return previousStrokes;
      }

      const updatedStrokes = [...previousStrokes];
      const currentStroke = updatedStrokes[updatedStrokes.length - 1];

      if (currentStroke.tool !== tool) {
        return previousStrokes;
      }

      updatedStrokes[updatedStrokes.length - 1] = {
        ...currentStroke,
        points: [...currentStroke.points, point]
      };

      return updatedStrokes;
    });
  };

  const handlePointerUpOrCancel = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'pointer') {
      return;
    }

    if (!isDrawingRef.current) {
      return;
    }

    isDrawingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleClearAnnotations = () => {
    setStrokes([]);
    setPointerPoint(null);
    setTool('none');
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
              aria-label="Fullscreen"
              title="Fullscreen"
            >
              <span aria-hidden="true">⤢</span>
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
        <div
          className={`annotation-toolbar annotation-toolbar--floating annotation-toolbar--mode-${tool}`}
          role="toolbar"
          aria-label="Annotation tools"
        >
          <div className="annotation-toolbar__group">
            {(['none', 'pen', 'highlight', 'pointer'] as AnnotationTool[]).map((nextTool) => (
              <button
                key={nextTool}
                className={`button button--ghost button--tool ${tool === nextTool ? 'is-active' : ''}`}
                type="button"
                onClick={() => setTool(nextTool)}
                aria-pressed={tool === nextTool}
                title={ANNOTATION_TOOL_LABELS[nextTool]}
                aria-label={ANNOTATION_TOOL_LABELS[nextTool]}
              >
                <span className="button--tool__icon" aria-hidden="true">
                  {ANNOTATION_TOOL_ICONS[nextTool]}
                </span>
              </button>
            ))}
            <button
              className={`button button--ghost button--tool button--tool--clear ${tool === 'erase' ? 'is-active' : ''}`}
              type="button"
              onClick={() => setTool('erase')}
              aria-pressed={tool === 'erase'}
              title={ANNOTATION_TOOL_LABELS.erase}
              aria-label={ANNOTATION_TOOL_LABELS.erase}
            >
              <span className="button--tool__icon" aria-hidden="true">
                {ANNOTATION_TOOL_ICONS.erase}
              </span>
            </button>
            <button
              className="button button--ghost button--tool button--tool--clear-all"
              type="button"
              onClick={handleClearAnnotations}
              disabled={strokes.length === 0 && !pointerPoint}
              title="모두 지우기"
              aria-label="모두 지우기"
            >
              <span className="button--tool__icon" aria-hidden="true">
                ✕
              </span>
            </button>
          </div>
        </div>
        <div className={`viewer-annotation-layer ${tool === 'none' ? 'is-passive' : ''}`}>
          <canvas
            ref={annotationCanvasRef}
            className={`viewer-annotation-canvas viewer-annotation-canvas--${tool}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUpOrCancel}
            onPointerCancel={handlePointerUpOrCancel}
            onPointerLeave={() => {
              if (tool === 'pointer') {
                setPointerPoint(null);
              }
            }}
          />
          {tool === 'pointer' && pointerPoint ? (
            <span
              className="viewer-pointer-dot"
              style={{
                left: `${pointerPoint.x * 100}%`,
                top: `${pointerPoint.y * 100}%`
              }}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
