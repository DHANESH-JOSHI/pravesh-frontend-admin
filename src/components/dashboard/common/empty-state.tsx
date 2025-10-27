import { Search } from "lucide-react";
import { CardContent } from "@/components/ui/card";

type Props = {
    title: string;
    description: string;
};

export function EmptyState({
    title,
    description,
}: Props) {
    return (
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="p-3 bg-muted rounded-full">
                <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
        </CardContent>
    );
}
