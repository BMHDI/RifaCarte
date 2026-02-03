// app/(details)/org/[id]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrg } from "@/app/context/OrgContext";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default async function OrgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  

  const { data: org, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !org) notFound();

  const logo = org.image_url || "https://edmonton.acfa.ab.ca/wp-content/uploads/2019/05/Logo-2-updatex-345x242.png";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* HEADER */}
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">
          <Link href="/" className="hover:underline">
            ← Retour à la carte
          </Link>
        </h1>
        <span className="text-sm text-muted-foreground">{org.category?.join(", ")}</span>
      </header>

      {/* MAIN CONTENT - Responsive */}
      <main className="flex flex-col md:flex-row max-w-6xl mx-auto py-8 px-4 gap-8">
        
        {/* COLONNE GAUCHE - Informations importantes */}
        <aside className="w-full md:w-80 flex-shrink-0 space-y-6">
          <div className="flex justify-center">
            <img
              src={logo}
              alt={org.name}
              className="h-28 w-auto object-contain rounded-lg shadow-md"
            />
          </div>

          <h2 className="text-2xl font-extrabold text-center">{org.name}</h2>

          {/* Contact & Info */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-2">
            {org.address && <p className="text-sm"><strong>Adresse :</strong> {org.address}</p>}
            {org.phone && <p className="text-sm"><strong>Téléphone :</strong> {org.phone}</p>}
            {org.email && <p className="text-sm"><strong>Email :</strong> {org.email}</p>}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button className="flex-1">Contacter</Button>
              <Button variant="outline" className="flex-1">Appeler</Button>
            </div>
          </div>
        </aside>

        {/* COLONNE DROITE - Description & projets */}
        <section className="flex-1 space-y-6">
          
          {/* Description */}
          {org.description && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{org.description}</p>
            </section>
          )}

          {/* Directeur */}
          {org.director && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Direction</h3>
              <p className="font-medium">{org.director.name}</p>
              <p className="text-sm text-muted-foreground">{org.director.title}</p>
            </section>
          )}

          {/* Services */}
          {org.services?.length > 0 && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Services</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {org.services.map((s: string) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Projets */}
          {org.projects?.length > 0 && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-3">
              <h3 className="text-xl font-semibold mb-2">Projets</h3>
              {org.projects.map((p: any, i: number) => (
                <Card key={i} className="border shadow-sm">
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                  </CardHeader>
                  {p.description && (
                    <CardContent className="text-muted-foreground">{p.description}</CardContent>
                  )}
                </Card>
              ))}
            </section>
          )}

        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-gray-800 text-center p-4 text-sm text-muted-foreground">
        © 2026 Francophone Directory
      </footer>
    </div>
  );
}
