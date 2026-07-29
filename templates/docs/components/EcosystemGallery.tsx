/** @jsx h */
import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import CopyableCommand from "./CopyableCommand.tsx";
import "./ecosystem-gallery.css";
import { allTags, ecosystemRegistry, installCommand } from "../data/ecosystem-registry.ts";
import type { EcosystemTypeFilter } from "../data/ecosystem.types.ts";

const typeLabels: Record<EcosystemTypeFilter, string> = {
  all: "All",
  plugin: "Plugins",
  theme: "Themes",
  starter: "Starters",
};

const typeFilters: EcosystemTypeFilter[] = ["all", "plugin", "theme", "starter"];

function matchesSearch(query: string, item: (typeof ecosystemRegistry)[number]): boolean {
  if (!query) return true;
  const haystack = [item.name, item.package, item.description, item.author, item.tags.join(" ")]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function EcosystemGallery() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<EcosystemTypeFilter>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(() => allTags(ecosystemRegistry), []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return ecosystemRegistry.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (activeTag && !item.tags.includes(activeTag)) return false;
      return matchesSearch(normalizedQuery, item);
    });
  }, [query, typeFilter, activeTag]);

  return (
    <div class="pp-eco-gallery">
      <div class="pp-eco-toolbar">
        <label class="pp-visually-hidden" for="pp-eco-search">
          Search plugins, themes, and starters
        </label>
        <input
          id="pp-eco-search"
          class="pp-eco-search"
          type="search"
          placeholder="Search by name, package, tag, or description…"
          value={query}
          onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
          autoComplete="off"
        />

        <div class="pp-eco-filters" role="group" aria-label="Filter by type">
          {typeFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              class={`pp-eco-filter-btn${typeFilter === filter ? " pp-eco-filter-btn-active" : ""}`}
              aria-pressed={typeFilter === filter}
              onClick={() => setTypeFilter(filter)}
            >
              {typeLabels[filter]}
            </button>
          ))}
        </div>

        {tags.length > 0 ? (
          <div class="pp-eco-tags" role="group" aria-label="Filter by tag">
            <button
              type="button"
              class={`pp-eco-tag-btn${activeTag === null ? " pp-eco-tag-btn-active" : ""}`}
              aria-pressed={activeTag === null}
              onClick={() => setActiveTag(null)}
            >
              All tags
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                class={`pp-eco-tag-btn${activeTag === tag ? " pp-eco-tag-btn-active" : ""}`}
                aria-pressed={activeTag === tag}
                onClick={() => setActiveTag((current) => (current === tag ? null : tag))}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p class="pp-eco-meta" aria-live="polite">
        Showing {filtered.length} of {ecosystemRegistry.length} entries
      </p>

      <div class="pp-eco-grid">
        {filtered.length === 0 ? (
          <p class="pp-eco-empty">No entries match your filters. Try another search or tag.</p>
        ) : (
          filtered.map((item) => (
            <article class="pp-eco-card" key={item.package}>
              <div class="pp-eco-card-body">
                <div class="pp-eco-card-head">
                  <h3>{item.name}</h3>
                  {item.official ? <span class="pp-eco-badge">Official</span> : null}
                </div>
                <p class="pp-eco-type">{typeLabels[item.type]}</p>
                <p>{item.description}</p>
                <ul class="pp-eco-card-tags" aria-label="Tags">
                  {item.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <dl class="pp-eco-card-meta">
                  <div>
                    <dt>Author</dt>
                    <dd>{item.author}</dd>
                  </div>
                  <div>
                    <dt>Package</dt>
                    <dd>
                      <code>{item.package}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>PreactPress</dt>
                    <dd>
                      <code>{item.preactpressVersion}</code>
                    </dd>
                  </div>
                </dl>
              </div>

              <div class="pp-eco-card-links">
                <a href={item.repository} target="_blank" rel="noreferrer">
                  Repository ↗
                </a>
                {item.documentation ? <a href={item.documentation}>Documentation</a> : null}
              </div>

              <CopyableCommand command={installCommand(item)} />
            </article>
          ))
        )}
      </div>

      <section class="pp-eco-guidelines" aria-labelledby="ecosystem-guidelines">
        <h2 id="ecosystem-guidelines">Submission guidelines</h2>
        <p>
          The gallery is a static registry in the PreactPress repository — there is no external
          package index or central registry service.
        </p>
        <ol>
          <li>
            Fork{" "}
            <a href="https://github.com/kamod-ch/preactpress" target="_blank" rel="noreferrer">
              kamod-ch/preactpress
            </a>{" "}
            and add your entry to <code>templates/docs/data/ecosystem-registry.ts</code>.
          </li>
          <li>
            Include a public repository URL, a short description, tags, the compatible PreactPress
            version range, and an author name or organization.
          </li>
          <li>
            Plugins should publish to npm under your scope or <code>@preactpress/*</code> for
            official packages. Themes and starters should be reproducible with{" "}
            <code>preactpress init</code> or documented theme setup.
          </li>
          <li>
            Set <code>official: true</code> only for packages maintained in the PreactPress
            monorepo. Community entries use <code>official: false</code>.
          </li>
          <li>
            Link to documentation when available — either a guide page in your repo or an external
            docs site.
          </li>
          <li>Open a pull request with a screenshot or short note on how you tested the entry.</li>
        </ol>
      </section>
    </div>
  );
}
