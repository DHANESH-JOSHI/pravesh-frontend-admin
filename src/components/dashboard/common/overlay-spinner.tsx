import { Loader2 } from "lucide-react";

export function OverlaySpinner({ show }: { show: boolean }) {
    if (!show) return null;
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    );
}
