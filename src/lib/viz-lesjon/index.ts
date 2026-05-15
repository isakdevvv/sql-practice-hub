import type { Lesson } from "./types";
import { lesson as iteratorerOgIterables } from "./lessons/iteratorer-og-iterables";

export const LESSONS: Lesson[] = [iteratorerOgIterables];

export function lessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}
