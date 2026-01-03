"use client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface CustomAlertDialogProps {
    isOpen: boolean;
    description?: string;
    title?: string;
    onCancel?: () => void;
    onContinue?: () => void;
    isLoading?: boolean;
}
export const CustomAlertDialog = ({
    isOpen,
    description = "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
    title = "Are you sure?",
    onCancel = () => { },
    onContinue = () => { },
    isLoading = false,
}: CustomAlertDialogProps) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onCancel}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onContinue} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
