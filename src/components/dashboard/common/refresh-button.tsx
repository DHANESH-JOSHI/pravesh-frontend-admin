import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    spinning?: boolean;
    onClick: () => void;
    ariaLabel?: string;
};

export function RefreshButton({
    spinning,
    onClick,
    ariaLabel = "Refresh",
}: Props) {
    return (
        <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            aria-label={ariaLabel}
        >
            <RefreshCcw
                className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
            />
        </Button>
    );
}
