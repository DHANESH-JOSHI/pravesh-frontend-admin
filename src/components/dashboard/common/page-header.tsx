import { cn } from "@/lib/utils";

type Props = {
  title: string;
};

export function PageHeader({ title }: Props) {
  return (
    <div className="space-y-2 md:space-y-3">
      <div>
        <h1
          className={cn(
            "tracking-tight leading-tight text-balance text-2xl md:text-3xl font-semibold md:font-bold",
          )}
        >
          {title}
        </h1>

      </div>
    </div>
  );
}
