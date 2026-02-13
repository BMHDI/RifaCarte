import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/mailer'; // Assurez-vous que le chemin est correct

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation simple
    if (!body.email || !body.firstName) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    await sendContactEmail(body);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Erreur Route Contact:', err);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email." }, { status: 500 });
  }
}