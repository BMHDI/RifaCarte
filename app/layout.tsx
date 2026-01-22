import type { Metadata } from "next";
import "./globals.css";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "carte des oraginazations",
  description:
    "carte des oraginazations, en alberta trouver test d'anglais, service de sante etc ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <meta charSet="utf-8" />
      <body className="h-svh w-svw overflow-hidden ">
        <Header />
        <SidebarProvider>
          <AppSidebar />
          {/* MAIN CONTENT */}
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
