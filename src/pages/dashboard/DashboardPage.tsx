import { TopBar } from '../../components/TopBar';
import { presentations } from '../../data/slides';

function formatTags(tags?: string[]): string {
  if (!tags || tags.length === 0) {
    return 'untagged';
  }

  return tags.join(' · ');
}

export function DashboardPage() {
  return (
    <main className="app-shell">
      <TopBar
        title="Presentation Dashboard"
        subtitle="정적 메타데이터 기반으로 발표를 탐색하고 즉시 실행합니다."
      />

      <section className="presentation-grid" aria-label="presentation list">
        {presentations.map((presentation) => (
          <article key={presentation.id} className="presentation-card">
            <p className="presentation-card__badge">
              {presentation.featured ? 'Featured' : 'Standard'}
            </p>
            <h2>{presentation.title}</h2>
            <p>{presentation.description ?? '설명 없음'}</p>
            <dl>
              <div>
                <dt>Updated</dt>
                <dd>{presentation.updatedAt}</dd>
              </div>
              <div>
                <dt>Tags</dt>
                <dd>{formatTags(presentation.tags)}</dd>
              </div>
            </dl>
            <a className="button" href={`/presentation/${presentation.id}`}>
              Open Presentation
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
