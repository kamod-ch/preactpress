/** @jsx h */
import { h } from "preact";
import { useMemo, useState } from "preact/hooks";

type Article = {
  title: string;
  href: string;
  description: string;
  category: string;
};

type Category = {
  title: string;
  href: string;
  details: string;
};

const articles: Article[] = [
  {
    title: "Welcome to Acme",
    href: "/getting-started/welcome",
    description: "What you need for the first successful sync.",
    category: "Getting started",
  },
  {
    title: "Create your account",
    href: "/getting-started/create-account",
    description: "Verify email and open your first workspace.",
    category: "Getting started",
  },
  {
    title: "Invite your team",
    href: "/getting-started/invite-team",
    description: "Send invites and choose member roles.",
    category: "Getting started",
  },
  {
    title: "Manage your subscription",
    href: "/account/manage-subscription",
    description: "Plans, invoices, and seat changes.",
    category: "Account & billing",
  },
  {
    title: "Fix login issues",
    href: "/troubleshooting/login-issues",
    description: "Reset passwords and recover locked accounts.",
    category: "Troubleshooting",
  },
  {
    title: "Enable two-factor authentication",
    href: "/privacy/two-factor",
    description: "Add an authenticator app to your account.",
    category: "Privacy & security",
  },
];

const categories: Category[] = [
  {
    title: "Getting started",
    href: "/getting-started/welcome",
    details: "Account setup, invites, first project",
  },
  {
    title: "Account & billing",
    href: "/account/manage-subscription",
    details: "Plans, payments, cancellation",
  },
  {
    title: "Troubleshooting",
    href: "/troubleshooting/login-issues",
    details: "Login, sync, notifications",
  },
  {
    title: "Privacy & security",
    href: "/privacy/two-factor",
    details: "2FA, data export, retention",
  },
];

const popular = [
  { title: "Welcome to Acme", href: "/getting-started/welcome", category: "Getting started" },
  { title: "Fix login issues", href: "/troubleshooting/login-issues", category: "Troubleshooting" },
  {
    title: "Manage your subscription",
    href: "/account/manage-subscription",
    category: "Billing",
  },
  { title: "Enable two-factor authentication", href: "/privacy/two-factor", category: "Security" },
];

export default function HelpHome() {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(needle) ||
        article.description.toLowerCase().includes(needle) ||
        article.category.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <div class="kb-home-inner">
      <section class="kb-hero">
        <p class="kb-eyebrow">Help Center</p>
        <h1>How can we help?</h1>
        <p>Search guides for account setup, billing, troubleshooting, and security.</p>
        <div class="kb-search">
          <svg class="kb-search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            />
          </svg>
          <input
            type="search"
            value={query}
            placeholder="Search for articles, e.g. password reset"
            aria-label="Search help articles"
            onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
          />
          {matches.length > 0 ? (
            <ul class="kb-search-results" role="listbox">
              {matches.map((article) => (
                <li key={article.href}>
                  <a href={article.href}>
                    {article.title}
                    <small>{article.category}</small>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
      <section class="kb-section" aria-labelledby="kb-categories-title">
        <h2 id="kb-categories-title">Browse by category</h2>
        <div class="kb-categories">
          {categories.map((category) => (
            <a class="kb-category" href={category.href} key={category.href}>
              <strong>{category.title}</strong>
              <span>{category.details}</span>
            </a>
          ))}
        </div>
      </section>
      <section class="kb-section" aria-labelledby="kb-popular-title">
        <h2 id="kb-popular-title">Popular articles</h2>
        <ul class="kb-popular">
          {popular.map((article) => (
            <li key={article.href}>
              <a href={article.href}>
                {article.title}
                <small>{article.category}</small>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
