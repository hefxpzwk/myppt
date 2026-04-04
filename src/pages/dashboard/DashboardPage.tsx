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
      if (!normalizedSearchQuery && sortKey === 'title') {
        return left.title.localeCompare(right.title);
      }

      return parseDate(right.updatedAt) - parseDate(left.updatedAt);
    });
  }, [searchQuery, selectedTag, sortKey]);

  return (
    <main className="app-shell dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>
            Content Insight <span>Workspace</span>
          </h1>
          <p className="dashboard-header__subtitle">
            Save content, summarize with AI, and connect insights faster.
          </p>
        </div>
      </header>

      <section className="dashboard-section" id="presentation-library" aria-label="presentation library">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">Presentation Library</h2>
          <p className="dashboard-section__meta">
            {filteredPresentations.length} / {presentations.length}
          </p>
        </div>

        <div className="dashboard-control-row">
          <label className="dashboard-filter" htmlFor="search-query">
            Search
            <input
              id="search-query"
              type="search"
              className="dashboard-filter__input"
              placeholder="Search title, description, tags"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <label className="dashboard-filter" htmlFor="tag-filter">
            Tag
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
            Sort
            <select
              id="sort-key"
              className="dashboard-filter__select"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as 'updated' | 'title')}
            >
              <option value="updated">Latest Updated</option>
              <option value="title">Title A-Z</option>
            </select>
          </label>
        </div>

        <div className="presentation-grid" aria-label="presentation list">
          {filteredPresentations.map((presentation) => (
            <a
              key={presentation.id}
              className="presentation-gallery-item"
              href={`/presentation/${presentation.id}`}
              aria-label={`${presentation.title} open presentation`}
            >
              <article className="presentation-card">
                <div className="presentation-card__cover" aria-hidden="true" />
                <p className="presentation-card__badge">
                  {presentation.featured ? 'Featured' : 'Standard'}
                </p>
                <h3>{presentation.title}</h3>
                <p className="presentation-card__meta">{presentation.updatedAt}</p>
                {presentation.description ? (
                  <p className="presentation-card__desc">{presentation.description}</p>
                ) : null}
              </article>
            </a>
          ))}

          {filteredPresentations.length === 0 ? (
            <article className="presentation-card presentation-card--empty">
              <h3>No matching content</h3>
              <p className="presentation-card__desc">Try adjusting your search or filters.</p>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
