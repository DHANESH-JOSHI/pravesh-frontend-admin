"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth";

export function HeaderUser() {
    const { user, logout } = useAuth();
    if (!user) return null;
    const initials = user.name?.trim()?.slice(0, 2).toUpperCase() || "U";
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    aria-label="Open user menu"
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9 p-0"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={"https://i.pravatar.cc/150?img=3"}
                            alt={user.name || "User"}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="min-w-56"
            >
                <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={"https://i.pravatar.cc/150?img=3"}
                                alt={user.name || "User"}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="grid leading-tight">
                            <span className="text-sm font-medium">
                                {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default HeaderUser;
