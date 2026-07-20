import type { FunctionalComponent } from "preact";

interface LogoProps {
  class?: string;
  label: string;
}

const Logo: FunctionalComponent<LogoProps> = ({ class: className, label }) => (
  <span class={`hn-logo ${className ?? ""}`.trim()} aria-label={label}>
    <svg aria-hidden="true" viewBox="0 0 36 36" width="36" height="36">
      <rect width="36" height="36" rx="11" fill="currentColor" opacity="0.12" />
      <path
        d="M19.8 5.5c.8 4-2.8 5.9-4.7 8.2-1.8 2.1-2.5 4.9-.3 7 0-2.8 1.7-4.6 4.2-6.7 3.2 3 5.3 5.8 5.3 9.2 0 4.4-3.3 7.3-7.6 7.3-4.8 0-8.3-3.6-8.3-8.4 0-6.1 6.3-9.2 11.4-16.6Z"
        fill="currentColor"
      />
      <path
        d="M21.7 25.7c0 2.2-1.7 3.8-3.9 3.8s-4-1.6-4-3.8c0-1.7 1-3.1 3.4-5.2.1 1.7 1.4 2.6 2.4 3.4.8.6 2.1 1 2.1 1.8Z"
        fill="currentColor"
        opacity="0.38"
      />
    </svg>
    <span>{label}</span>
  </span>
);

export default Logo;
