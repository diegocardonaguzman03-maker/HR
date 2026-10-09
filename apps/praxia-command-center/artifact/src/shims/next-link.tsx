import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { nav } from "../router";

export default function Link({ href, onClick, target: _t, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={"#" + href.replace(/[^a-zA-Z0-9]/g, "-")}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        nav.push(href);
      }}
      {...rest}
    />
  );
}
