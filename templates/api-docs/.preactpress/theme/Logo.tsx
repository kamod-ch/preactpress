import type { FunctionalComponent } from "preact";

interface LogoProps {
  class?: string;
  label: string;
}

const Logo: FunctionalComponent<LogoProps> = ({ class: className, label }) => (
  <span class={`protocol-logo ${className ?? ""}`.trim()} aria-label={label}>
    <svg aria-hidden="true" viewBox="0 0 32 32" width="28" height="28">
      <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.15" />
      <path
        d="M8 22V10h4.2c2.4 0 3.9 1.3 3.9 3.3 0 1.3-.7 2.3-1.9 2.8L18.8 22h-3.2l-4-5.3H11V22H8Zm3-8.2h1.1c1.1 0 1.7-.5 1.7-1.4s-.6-1.4-1.7-1.4H11v2.8Zm10.4 8.8c-2.9 0-4.8-2-4.8-5.1S18.5 12.4 21.4 12.4c2.9 0 4.8 2 4.8 5.1s-1.9 5.1-4.8 5.1Zm0-2.4c1.3 0 2.1-1.1 2.1-2.7s-.8-2.7-2.1-2.7-2.1 1.1-2.1 2.7.8 2.7 2.1 2.7Z"
        fill="currentColor"
      />
    </svg>
    <span class="protocol-logo-label">{label}</span>
  </span>
);

export default Logo;
