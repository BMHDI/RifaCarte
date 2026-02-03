import type { Metadata } from "next";
import "@/app/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { OrgProvider } from "@/app/context/OrgContext"; // import your context provider
import { Analytics }  from "../googleAnalytics"; // the client wrapper

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
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="h-svh w-svw overflow-hidden">
                <Analytics /> {/* Client GA component */}

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
