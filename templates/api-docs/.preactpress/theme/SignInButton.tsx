import type { FunctionalComponent } from "preact";
import { withBase } from "@kamod-ch/preactpress/client";

export interface SignInLink {
  text: string;
  link: string;
}

interface SignInButtonProps {
  signIn?: SignInLink;
  base: string;
}

const SignInButton: FunctionalComponent<SignInButtonProps> = ({ signIn, base }) => {
  if (!signIn) return null;
  return (
    <a class="protocol-signin" href={withBase(base, signIn.link)}>
      {signIn.text}
    </a>
  );
};

export default SignInButton;
