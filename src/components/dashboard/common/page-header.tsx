import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  title: string;
  actions?: ReactNode;
};

export function PageHeader({ title, actions }: Props) {
  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex items-center justify-between">
        <h1
          className={cn(
            "tracking-tight leading-tight text-balance text-2xl md:text-3xl font-semibold md:font-bold",
          )}
        >
          {title}
        </h1>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
