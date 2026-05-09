// Shared shape for inline documentation references on exercises.
//
// An exercise points to one or more DocRefs; the UI renders them as a small
// panel under the prompt with a clickable title and optional code snippet,
// so the user gets the relevant docs without leaving the page.

export interface DocRef {
  /** Short label shown as the clickable link, e.g. "mysql.connector.connect". */
  title: string;
  /** External docs URL the title links to. */
  url: string;
  /** Optional inline code snippet rendered in a <pre> block under the link. */
  snippet?: string;
  /** Optional one-line explanation shown next to the link. */
  note?: string;
}
