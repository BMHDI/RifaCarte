"use client"

import { useOrg } from "@/app/context/OrgContext"
import { OrgCard } from "@/components/ui/OrgCard"

export default function FavoritesPage() {
  const { savedOrgs, toggleSavedOrg } = useOrg()

  if (!savedOrgs.length) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Pas de favoris enregistrés pour l&apos;instant  ❤️
      </div>
    )
  }

  return (
        <div className=" grid gap-4 overflow-y-auto [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
      {savedOrgs.map((org) => (
        <OrgCard
          id={org.id ?? ""}
          image_url={org.image_url ?? ""}
          key={org.id}
          name={org.name}
          phone={org.contact?.phone ?? ""}
          address={org.locations?.[0]?.address ?? ""}
          category={org.category}
          onSave={() => toggleSavedOrg(org)}
          isSaved
        />
      ))}
    </div>
  )
}
