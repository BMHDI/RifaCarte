// app/(details)/[id]/page.tsx
import { notFound } from "next/navigation";
import { supabase } from "@/lib/db";
import { OrgDetailsClient } from "./OrgDetailsClient";
import { Header } from "@/components/layout/Header";

export default async function OrgPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { region?: string };
}) {
  const { id } = await params; // <-- unwrap here
  console.log("Fetching details for org ID:", id);

  const { data: org, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !org) notFound();
const normalizedOrg = {
  ...org,
  name: typeof org.name === "string" ? org.name : org.name?.first || "",
  description: typeof org.description === "string" ? org.description : org.description?.text || "",
  directorName: org.director?.name || "",
  directorTitle: org.director?.title || "",
projects: Array.isArray(org.projects)
  ? org.projects.map((proj: { name?: string; description?: string }) => ({
      name: proj.name || "",
      description: proj.description || "",
    }))
  : [],
  category: Array.isArray(org.category) ? org.category : [],
  tags: Array.isArray(org.tags) ? org.tags : [],
};


  return<> <Header/>  <OrgDetailsClient org={normalizedOrg} /></>;
  
}
