import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import QueryProvider from "@/providers/query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth";
import { ViewTransitions } from "next-view-transitions";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
          <AuthProvider>
            <QueryProvider>
              <main className="min-h-screen vt-page">{children}</main>
            </QueryProvider>
          </AuthProvider>
          <Toaster richColors theme="light" />
        </body>
      </html>
    </ViewTransitions>
  );
}
