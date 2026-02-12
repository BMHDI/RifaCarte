// BackButton.tsx
'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-md font-bold text-primary p-2 hover:underline"
    >
      <ArrowLeft size={24} />
      Retour à la carte
    </button>
  );
}
