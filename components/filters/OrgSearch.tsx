"use client"

import { useState } from "react"
import organizations from "@/lib/org.json"

// normalisation : minuscules + enlever accents
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

const stopWords = ["pour", "les", "de", "du", "des", "la", "le", "un", "une", "et"]

export function OrgSearch() {
  const [query, setQuery] = useState("")

  // 🔹 Filtrage OR logique
  const filteredOrgs = organizations.filter((org) => {
    if (!query) return true

    // Découpe la query en mots, supprime les stopwords
    const queryWords = normalize(query)
      .split(/\s+/)
  .filter((w) => w && !stopWords.includes(w)) // remove empty strings + stopwords

    if (queryWords.length === 0) return false

    // ✅ Retourne vrai si AU MOINS un mot de la query est inclus dans les keywords
    return queryWords.some((word) =>
      org.keywords.some((k) => normalize(k).includes(word))
    )
  })

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">Rechercher un organisme par mot-clé</h2>

      <input
        type="text"
        value={query}
        placeholder="Tapez un mot-clé, ex: santé, emploi..."
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      {filteredOrgs.length === 0 && <p>Aucun organisme trouvé.</p>}

      <ul>
        {filteredOrgs.map((org) => (
          <li key={org.id} className="border-b py-2">
            <p className="font-medium">{org.name}</p>
            <p className="text-sm text-gray-600">{org.category}</p>
            <p className="text-sm">
              Mots-clés : {org.keywords.join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
