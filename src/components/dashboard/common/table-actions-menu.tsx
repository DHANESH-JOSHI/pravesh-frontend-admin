"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

export type TableActionsMenuProps = {
    onEdit?: () => void;
    onDelete?: () => void;
};

export function TableActionsMenu({ onEdit, onDelete }: TableActionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {onEdit ? (
                    <DropdownMenuItem className="gap-2" onClick={onEdit}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                ) : null}
                {onDelete ? (
                    <DropdownMenuItem
                        className="gap-2 text-destructive"
                        onClick={onDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default TableActionsMenu;
