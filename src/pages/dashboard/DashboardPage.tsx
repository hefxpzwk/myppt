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

  const summaryUsageRatio = Math.min(100, Math.round((presentations.length / 20) * 100));

  return (
    <main className="app-shell dashboard-page">
      <section className="dashboard-canvas">
        <header className="dashboard-header">
          <div>
            <h1>
              Content Insight <span>Workspace</span>
            </h1>
            <p className="dashboard-header__subtitle">
              Save content, summarize with AI, and connect insights faster.
            </p>
          </div>
          <div className="dashboard-cta-card">
            <p className="dashboard-cta-card__title">Quick Start</p>
            <div className="dashboard-cta-card__actions">
              {latestPresentation ? (
                <a className="button" href={`/presentation/${latestPresentation.id}`}>
                  View Content
                </a>
              ) : (
                <a className="button" href="#presentation-library">
                  View Content
                </a>
              )}
            </div>
          </div>
        </header>

        <section className="dashboard-section" aria-label="key metrics">
          <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">Key Metrics</h2>
          </div>
          <div className="dashboard-summary">
            <article className="summary-card">
              <p className="summary-card__label">Saved Content</p>
              <p className="summary-card__value">{presentations.length}</p>
              <p className="summary-card__meta">Content storage is unlimited</p>
            </article>
            <article className="summary-card">
              <p className="summary-card__label">AI Summaries</p>
              <p className="summary-card__value">{summaryUsageRatio}%</p>
              <p className="summary-card__meta">{presentations.length}/20 summaries used this month</p>
            </article>
            <article className="summary-card">
              <p className="summary-card__label">Current Plan</p>
              <p className="summary-card__value">FREE</p>
              <p className="summary-card__meta">Using Free plan</p>
            </article>
          </div>
        </section>

        <section className="dashboard-section" aria-label="quick actions">
          <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">Quick Actions</h2>
          </div>
          <div className="quick-action-grid">
            <a className="quick-action-card" href="#presentation-library">
              <h3>View Content</h3>
              <p>Browse and search your saved presentations.</p>
            </a>
            <a className="quick-action-card" href="#presentation-library">
              <h3>Manage Library</h3>
              <p>Filter by tag and sort your decks quickly.</p>
            </a>
            <a className="quick-action-card" href="#presentation-library">
              <h3>Install Extension</h3>
              <p>Capture references in one click while you browse.</p>
            </a>
            <a className="quick-action-card" href="#presentation-library">
              <h3>Get Support</h3>
              <p>Open usage guide and workflow tips.</p>
            </a>
          </div>
        </section>

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
                <h3>No matching content</h3>
                <p className="presentation-card__desc">Try adjusting your search or filters.</p>
              </article>
            ) : null}
          </div>
        </section>

      </section>
    </main>
  );
}
