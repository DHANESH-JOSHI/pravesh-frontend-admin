import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import QueryProvider from "@/providers/query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth";
import { ViewTransitions } from "next-view-transitions";
import { MetaUpdater } from "@/components/dashboard/meta-updater";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pravesh Hardware Dashboard",
  description: "Admin dashboard for Pravesh Hardware",
  icons: {
    icon: "https://img.freepik.com/premium-vector/white-logo-construction-project-called-construction_856308-794.jpg?semt=ais_hybrid&w=740&q=80",
    apple: "https://img.freepik.com/premium-vector/white-logo-construction-project-called-construction_856308-794.jpg?semt=ais_hybrid&w=740&q=80",
  },
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
          <AuthProvider>
            <QueryProvider>
              <MetaUpdater />
              <main className="min-h-screen vt-page">{children}</main>
            </QueryProvider>
          </AuthProvider>
          <Toaster richColors theme="light" />
        </body>
      </html>
    </ViewTransitions>
  );
}
