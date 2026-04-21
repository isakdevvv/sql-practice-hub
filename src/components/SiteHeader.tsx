import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground font-bold text-sm">
            S
          </div>
          <span className="font-semibold tracking-tight">SQL Sandbox</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/practice"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            activeProps={{ className: "rounded-md px-3 py-1.5 text-foreground bg-accent" }}
          >
            Practice
          </Link>
          <Link
            to="/exam"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            activeProps={{ className: "rounded-md px-3 py-1.5 text-foreground bg-accent" }}
          >
            Exam
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            activeProps={{ className: "rounded-md px-3 py-1.5 text-foreground bg-accent" }}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
