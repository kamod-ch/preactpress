import type { FunctionalComponent } from "preact";

interface LogoProps {
  class?: string;
  label: string;
}

const Logo: FunctionalComponent<LogoProps> = ({ class: className, label }) => (
  <span class={`sd-logo ${className ?? ""}`.trim()} aria-label={label}>
    <svg aria-hidden="true" viewBox="0 0 36 36" width="36" height="36">
      <rect width="36" height="36" rx="10" fill="currentColor" opacity="0.12" />
      <rect x="8" y="8" width="8.5" height="8.5" rx="2" fill="currentColor" />
      <rect x="19.5" y="8" width="8.5" height="8.5" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="8" y="19.5" width="8.5" height="8.5" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="19.5" y="19.5" width="8.5" height="8.5" rx="2" fill="currentColor" />
    </svg>
    <span>{label}</span>
  </span>
);

export default Logo;
