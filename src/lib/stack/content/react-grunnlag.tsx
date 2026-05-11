import { ReactGrunnlagPage } from "@/components/stack/react-grunnlag/ReactGrunnlagPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-react-grunnlag",
  slug: "react-grunnlag",
  title: "React-grunnlag",
  group: "stack",
  order: 72,
  status: "ready",
  shortDescription:
    "Komponenter, JSX, props, useState, useEffect (cleanup), lifting state, controlled forms, useMemo/useCallback/useRef, context, custom hooks, vanlige feller.",
  prerequisites: [
    { slug: "javascript-grunnlag", title: "JavaScript-grunnlag" },
  ],
  Component: ReactGrunnlagPage,
};
