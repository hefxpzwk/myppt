import { useMemo, useState } from 'react';
import { presentations } from '../../data/slides';

function parseDate(updatedAt: string): number {
  return new Date(updatedAt).getTime() || 0;
}

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortKey, setSortKey] = useState<'updated' | 'title'>('updated');

  const availableTags = useMemo(() => {
    return Array.from(
      new Set(presentations.flatMap((presentation) => presentation.tags ?? [])),
    ).sort((a, b) => a.localeCompare(b));
  }, []);

  const featuredCount = useMemo(() => {
    return presentations.filter((presentation) => presentation.featured).length;
  }, []);

  const filteredPresentations = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const filtered = presentations.filter((presentation) => {
      const tags = presentation.tags ?? [];
      const matchesTag = selectedTag === 'all' || tags.includes(selectedTag);

      if (!normalizedSearchQuery) {
        return matchesTag;
      }

      const searchTarget = [presentation.title, presentation.description ?? '', ...tags]
        .join(' ')
        .toLowerCase();

      return matchesTag && searchTarget.includes(normalizedSearchQuery);
    });

    return filtered.sort((left, right) => {
      if (sortKey === 'title') {
        return left.title.localeCompare(right.title);
      }

      return parseDate(right.updatedAt) - parseDate(left.updatedAt);
    });
  }, [searchQuery, selectedTag, sortKey]);

  const latestPresentation = useMemo(() => {
    return [...presentations].sort((left, right) => {
      return parseDate(right.updatedAt) - parseDate(left.updatedAt);
    })[0];
  }, []);

  return (
    <main className="app-shell dashboard-page">
      <section className="dashboard-canvas">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-header__chip">MyPPT Presentation Hub</p>
            <h1>
              발표 운영을 위한 <span>실무형 대시보드</span>
            </h1>
            <p className="dashboard-header__subtitle">
              검색, 필터, 정렬 후 즉시 발표 화면으로 진입할 수 있습니다.
            </p>
          </div>
          <div className="dashboard-cta-card">
            <p className="dashboard-cta-card__title">Quick Launch</p>
            <div className="dashboard-cta-card__actions">
              {latestPresentation ? (
                <a className="button" href={`/presentation/${latestPresentation.id}`}>
                  최근 발표 열기
                </a>
              ) : null}
              <a className="button button--ghost" href="#presentation-library">
                목록으로 이동
              </a>
            </div>
          </div>
        </header>

        <section className="dashboard-summary" aria-label="dashboard summary">
          <article className="summary-card">
            <p className="summary-card__label">Total Presentations</p>
            <p className="summary-card__value">{presentations.length}</p>
          </article>
          <article className="summary-card">
            <p className="summary-card__label">Featured Decks</p>
            <p className="summary-card__value">{featuredCount}</p>
          </article>
          <article className="summary-card">
            <p className="summary-card__label">Available Tags</p>
            <p className="summary-card__value">{availableTags.length}</p>
          </article>
        </section>

        <section className="dashboard-section" id="presentation-library" aria-label="presentation library">
          <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">발표 라이브러리</h2>
            <p className="dashboard-section__meta">
              {filteredPresentations.length} / {presentations.length}
            </p>
          </div>

          <div className="dashboard-control-row">
            <label className="dashboard-filter" htmlFor="search-query">
              검색
              <input
                id="search-query"
                type="search"
                className="dashboard-filter__input"
                placeholder="제목, 설명, 태그 검색"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className="dashboard-filter" htmlFor="tag-filter">
              태그
              <select
                id="tag-filter"
                className="dashboard-filter__select"
                value={selectedTag}
                onChange={(event) => setSelectedTag(event.target.value)}
              >
                <option value="all">All Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>

            <label className="dashboard-filter" htmlFor="sort-key">
              정렬
              <select
                id="sort-key"
                className="dashboard-filter__select"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as 'updated' | 'title')}
              >
                <option value="updated">최신 업데이트 순</option>
                <option value="title">제목 가나다순</option>
              </select>
            </label>
          </div>

          <div className="presentation-grid" aria-label="presentation list">
            {filteredPresentations.map((presentation) => (
              <article key={presentation.id} className="presentation-card">
                <p className="presentation-card__badge">
                  {presentation.featured ? 'Featured' : 'Standard'}
                </p>
                <h3>{presentation.title}</h3>
                <p className="presentation-card__meta">{presentation.updatedAt}</p>
                <a className="button" href={`/presentation/${presentation.id}`}>
                  Open Presentation
                </a>
              </article>
            ))}

            {filteredPresentations.length === 0 ? (
              <article className="presentation-card presentation-card--empty">
                <h3>검색 결과가 없습니다</h3>
                <p className="presentation-card__desc">검색어 또는 필터를 조정해 다시 시도해 주세요.</p>
              </article>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
