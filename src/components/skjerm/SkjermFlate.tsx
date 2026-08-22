import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Standardflaten et skjerminnhold skal ligge på. Sentrerer innholdet
 * vertikalt når det er kort, og lar det scrolle internt når det ikke er det
 * — sidens ytre layout scroller aldri.
 *
 * Bredden er kappet på 44rem: på tablet i landskap blir en full-bredde
 * tekstlinje uleselig lang (over 90 tegn), og vi vil ha samme lesemål som
 * på telefon.
 */
export function SkjermFlate({
  children,
  className,
  /** Sett `bred` for simulatorer og diagrammer som trenger hele flaten. */
  bred = false,
}: {
  children: ReactNode;
  className?: string;
  bred?: boolean;
}) {
  return (
    <div className="flex h-full w-full justify-center overflow-y-auto overscroll-contain px-5 py-6">
      <div
        className={cn(
          "flex w-full flex-col justify-center gap-4 my-auto",
          bred ? "max-w-3xl" : "max-w-[44rem]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Tittelen inne i en skjerm. Egen komponent så typografien er lik overalt
 *  og vi kan justere ett sted. */
export function SkjermTittel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-balance text-xl font-semibold leading-snug sm:text-2xl">{children}</h2>
  );
}
