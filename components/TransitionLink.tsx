"use client";

import { AnchorHTMLAttributes, MouseEvent } from "react";
import { useTransition } from "@/components/TransitionProvider";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  label?: string;
}

export default function TransitionLink({
  href,
  label,
  onClick,
  children,
  ...rest
}: Props) {
  const { navigate } = useTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href, label);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
