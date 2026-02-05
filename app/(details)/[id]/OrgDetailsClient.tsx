"use client";

import { useOrg } from "@/app/context/OrgContext";
import Link from "next/link";
import { Mail, Phone, Globe, MapPin } from "lucide-react";
import { ShareButton } from "@/components/ui/ShareButton";
import { Button } from "@/components/ui/button";
import { OrgMap } from "@/components/map/OrgMap";

export function OrgDetailsClient({ org }: { org: any }) {
  const { activeRegion } = useOrg();
  console.log("OrgDetailsClient org:", org);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* BACK LINK */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link
          href={`/?region=${activeRegion || ""}`}
          className="inline-flex items-center gap-2 text-md font-bold text-primary hover:underline"
        >
          <MapPin size={16} />
          Retour à la carte
        </Link>
      </div>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-4 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
        {/* LEFT – ABOUT */}
        <section>
          <img
            src={org.image_url}
            alt={org.name}
            className="h-40 object-cover block mx-auto rounded-lg"
          />
          <h1 className="text-3xl font-bold mb-4 text-primary ">{org.name}</h1>

          <h2 className="text-lg font-semibold mb-4">À propos</h2>

          {org.description ? (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {org.description}
            </p>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Aucune description disponible pour cette organisation.
            </p>
          )}

          {org.director && (
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              <strong>Directeur:</strong> {org.director.name} (
              {org.director.title})
            </p>
          )}

          {org.services && org.services.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Services proposés</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
                {org.services.map((service: string, index: number) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            </div>
          )}

          {org.projects && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Projet phare</h2>
              {org.projects.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
                  {org.projects.map((project: any, index: number) => (
                    <li key={index}>
                      <strong>{project.name}</strong>
                      {project.description && `: ${project.description}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Pas de projets phare</p>
              )}
            </div>
          )}
        </section>

        {/* RIGHT – SIDEBAR */}
        <aside className="space-y-6">
          {/* MAP PLACEHOLDER */}
          <div className="rounded-lg overflow-hidden border">
            {org.lat && org.lng && <OrgMap lat={org.lat} lng={org.lng} />}
          </div>

          {/* CONTACTS */}
          <div className="border rounded-lg p-5 space-y-4">
            <h3 className="font-semibold">Contacts</h3>

            {org.address && (
              <div className="flex gap-3 text-sm">
                <MapPin size={16} className="mt-1 text-gray-500" />
                <span>{org.address}</span>
              </div>
            )}

            {org.phone && (
              <div className="flex gap-3 text-sm">
                <Phone size={16} className="mt-1 text-gray-500" />
                <span>{org.phone}</span>
              </div>
            )}

            {org.email && (
              <div className="flex gap-3 text-sm">
                <Mail size={16} className="mt-1 text-gray-500" />
                <a
                  href={`mailto:${org.email}`}
                  className="hover:underline"
                >
                  {org.email}
                </a>
              </div>
            )}

            {org.website && (
              <div className="flex gap-3 text-sm">
                <Globe size={16} className="mt-1 text-gray-500" />
                <a
                  href={org.website}
                  target="_blank"
                  className="hover:underline"
                >
                  {org.website}
                </a>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  window.location.href = `mailto:${org.email}`;
                }}
              >
                Contacter
              </Button>
              <ShareButton id={org.id} name={org.name} />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
