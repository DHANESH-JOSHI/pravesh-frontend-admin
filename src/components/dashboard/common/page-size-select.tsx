"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  action: (value: string) => void;
  options?: number[];
  className?: string;
};

export function PageSizeSelect({ value, action, options = [4,8, 10, 12, 16], className }: Props) {
  return (
    <Select value={String(value)} onValueChange={action}>
      <SelectTrigger className={cn("h-9 w-32", className)}>
        <SelectValue placeholder="Per page" />
      </SelectTrigger>
      <SelectContent>
        {options.map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n} / page
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default PageSizeSelect;
