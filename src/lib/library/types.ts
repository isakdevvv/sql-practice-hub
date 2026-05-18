import type { LucideIcon } from "lucide-react";

export type LibraryKind = "lek" | "laer" | "test";

export type LibraryItem = {
  slug: string;
  title: string;
  kind: LibraryKind;
  tags: string[];
  href: string;
  blurb?: string;
  Icon?: LucideIcon;
  subjectSlug?: string;
};
