import type { Metadata } from "next";
import "./globals.css";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { OrgProvider } from "@/app/context/OrgContext"; // import your context provider


export const metadata: Metadata = {
  title: "carte des organisations",
  description:
    "carte des organisations, en Alberta trouver test d'anglais, service de santé, etc.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="overflow-hidden">
      <meta charSet="utf-8" />
      <body className="h-svh w-svw overflow-hidden">
        <OrgProvider>
          <Header />
          <SidebarProvider>
            <AppSidebar />
            {/* MAIN CONTENT */}
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </OrgProvider>
      </body>
    </html>
  );
}
