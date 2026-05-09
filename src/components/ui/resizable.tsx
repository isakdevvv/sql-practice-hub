import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof Group>) => (
  <Group className={cn("flex h-full w-full", className)} {...props} />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) => (
  <Separator
    className={cn(
      "relative flex shrink-0 items-center justify-center bg-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      // Horizontal group → vertical handle (1px wide, full height)
      "aria-[orientation=horizontal]:w-px aria-[orientation=horizontal]:cursor-col-resize",
      "aria-[orientation=horizontal]:after:absolute aria-[orientation=horizontal]:after:inset-y-0 aria-[orientation=horizontal]:after:left-1/2 aria-[orientation=horizontal]:after:w-2 aria-[orientation=horizontal]:after:-translate-x-1/2",
      // Vertical group → horizontal handle (1px tall, full width)
      "aria-[orientation=vertical]:h-px aria-[orientation=vertical]:w-full aria-[orientation=vertical]:cursor-row-resize",
      "aria-[orientation=vertical]:after:absolute aria-[orientation=vertical]:after:inset-x-0 aria-[orientation=vertical]:after:top-1/2 aria-[orientation=vertical]:after:h-2 aria-[orientation=vertical]:after:-translate-y-1/2",
      "hover:bg-brand/40 transition-colors",
      "[&[aria-orientation=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
