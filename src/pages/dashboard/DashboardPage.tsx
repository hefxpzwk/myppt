import { useMemo, useState } from 'react';
import { TopBar } from '../../components/TopBar';
import { presentations } from '../../data/slides';

function formatTags(tags?: string[]): string {
  if (!tags || tags.length === 0) {
    return 'untagged';
  }

  return tags.join(' · ');
}

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  const availableTags = useMemo(() => {
    return Array.from(
      new Set(presentations.flatMap((presentation) => presentation.tags ?? [])),
    ).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredPresentations = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return presentations.filter((presentation) => {
      const tags = presentation.tags ?? [];
      const matchesTag = selectedTag === 'all' || tags.includes(selectedTag);

      if (!normalizedSearchQuery) {
        return matchesTag;
      }

      const searchTarget = [
        presentation.title,
        presentation.description ?? '',
        ...tags,
      ]
        .join(' ')
        .toLowerCase();

      return matchesTag && searchTarget.includes(normalizedSearchQuery);
    });
  }, [searchQuery, selectedTag]);

  return (
    <main className="app-shell">
      <TopBar
        title="Presentation Dashboard"
        subtitle="정적 메타데이터 기반으로 발표를 탐색하고 즉시 실행합니다."
      />

      <section className="filter-panel" aria-label="dashboard filter">
        <div className="filter-controls">
          <label className="filter-control" htmlFor="search-query">
            Search
            <input
              id="search-query"
              type="search"
              className="filter-input"
              placeholder="제목, 설명, 태그 검색"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <label className="filter-control" htmlFor="tag-filter">
            Tag
            <select
              id="tag-filter"
              className="filter-select"
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
        </div>
        <p className="filter-meta">
          {filteredPresentations.length} / {presentations.length} presentations
        </p>
      </section>

      <section className="presentation-grid" aria-label="presentation list">
        {filteredPresentations.map((presentation) => (
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

        {filteredPresentations.length === 0 ? (
          <article className="presentation-card presentation-card--empty">
            <h2>검색 결과가 없습니다</h2>
            <p>검색어 또는 태그 필터를 조정해 다시 시도해 주세요.</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}
