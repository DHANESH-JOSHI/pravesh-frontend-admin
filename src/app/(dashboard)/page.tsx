import { Newspaper, Handshake, Image as ImageIcon, HelpCircle, FileText } from "lucide-react";
import { LinkCard } from "@/components/dashboard/link-card";
const dashboardCards = [
    {
        href: "/blogs",
        icon: Newspaper,
        title: "Blogs",
        description: "Create and manage blog posts",
    },
    {
        href: "/faqs",
        icon: HelpCircle,
        title: "FAQs",
        description: "Manage frequently asked questions",
    },
    {
        href: "/images",
        icon: ImageIcon,
        title: "Images",
        description: "Manage gallery images",
    },
    {
        href: "/usps",
        icon: HelpCircle,
        title: "USPs",
        description: "Create, edit, and manage USPs.",
    },
    {
        href: "/trainers",
        icon: FileText,
        title: "Trainers",
        description: "Create, edit, and manage your trainers.",
    },
    {
        href: "/companies",
        icon: Handshake,
        title: "Companies",
        description: "Create, edit, and manage your company profiles.",
    },
    {
        href: "/branches",
        icon: FileText,
        title: "Branches",
        description: "Create, edit, and manage your branches.",
    },
    {
        href: "/courses",
        icon: FileText,
        title: "Courses",
        description: "Create, edit, and manage courses.",
    },
    {
        href: "/placements",
        icon: Handshake,
        title: "Placements",
        description: "Create, edit, and manage placements.",
    },
    {
        href: "/testimonials",
        icon: HelpCircle,
        title: "Testimonials",
        description: "Create, edit, and manage testimonials.",
    },
    {
        href: "/settings",
        icon: FileText,
        title: "Settings",
        description: "Create, edit, and manage settings.",
    },
];
export default function DashboardPage() {
    return (
        <div className="min-h-screen p-8 bg-background">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">
                    Welcome to Pravesh Admin Dashboard
                </h1>
                <p className="text-muted-foreground mb-8 text-lg">
                    Manage your content, images, and more from one place.
                </p>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {dashboardCards.map(card => (
                        <LinkCard key={card.title} {...card} />
                    ))}
                </div> */}
            </div>
        </div>
    );
}