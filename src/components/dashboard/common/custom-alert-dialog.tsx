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

interface CustomAlertDialogProps {
    isOpen: boolean;
    description?: string;
    title?: string;
    onCancel?: () => void;
    onContinue?: () => void;
}
export const CustomAlertDialog = ({
    isOpen,
    description = "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
    title = "Are you sure?",
    onCancel = () => { },
    onContinue = () => { },
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
                    <AlertDialogCancel onClick={onCancel}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onContinue}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
