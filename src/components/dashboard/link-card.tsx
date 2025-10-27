import {Link} from "next-view-transitions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface LinkCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function LinkCard(props: LinkCardProps) {
  const { href, title, icon: Icon, description } = props;
  return (
    <Link href={href} className="group">
      <Card className="transition-shadow group-hover:shadow-lg cursor-pointer flex flex-col h-full min-h-60">
        <CardHeader className="flex flex-col items-center flex-1 justify-center">
          <div className="bg-primary/10 rounded-lg p-2">
            <span className="text-secondary"><Icon className="w-8 h-8" /></span>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground flex-1 flex items-center justify-center">
          {description}
        </CardContent>
      </Card>
    </Link>
  );
}
