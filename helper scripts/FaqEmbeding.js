/**
 * Stand-alone FAQ embedding script
 * Run with: node FaqEmbedding.js
 */

import 'dotenv/config';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

/* ─────────────────────────────────────────────── */
/* ENV & CLIENTS                                   */
/* ─────────────────────────────────────────────── */

const { SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
  throw new Error('Missing SUPABASE_URL, SUPABASE_KEY, or GEMINI_API_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FAQ_URL = 'https://rifalberta.com/en/faq/';

/* ─────────────────────────────────────────────── */
/* UTILS                                          */
/* ─────────────────────────────────────────────── */

async function fetchWithTimeout(url, options, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/* ─────────────────────────────────────────────── */
/* EMBEDDING                                      */
/* ─────────────────────────────────────────────── */

// Use gemini-embedding-001 (the modern version of embedding-001)
const GEMINI_EMBED_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent';

async function embedText(text) {
  const res = await fetchWithTimeout(`${GEMINI_EMBED_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/gemini-embedding-001', // Explicitly name the model
      content: { parts: [{ text }] },
      task_type: 'RETRIEVAL_DOCUMENT',
      outputDimensionality: 1536, // <--- CRITICAL: Force 1536 dimensions
    }),
  });

  const json = await res.json();

  if (!res.ok || !json?.embedding?.values) {
    console.error('❌ Gemini response:', json);
    throw new Error(`Embedding failed: ${json.error?.message || res.statusText}`);
  }

  return json.embedding.values;
}

/* ─────────────────────────────────────────────── */
/* FAQ SCRAPER                                    */
/* ─────────────────────────────────────────────── */

async function fetchFAQ() {
  const res = await fetch(FAQ_URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  const items = [];

  $('#content h2, #content h3, #content p, #content ul').each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();

    if (!text) return;

    if (tag === 'h2' || tag === 'h3') {
      items.push({ question: text, answer: '' });
    } else if (items.length > 0) {
      items[items.length - 1].answer += (items[items.length - 1].answer ? '\n' : '') + text;
    }
  });

  console.log(`📄 Parsed FAQ items: ${items.length}`);
  return items.filter((i) => i.answer.length > 20);
}

/* ─────────────────────────────────────────────── */
/* DATABASE INSERT                                */
/* ─────────────────────────────────────────────── */

async function insertFAQ() {
  const faqs = await fetchFAQ();

  for (const faq of faqs) {
    const text = `${faq.question}\n${faq.answer}`;

    try {
      const embedding = await embedText(text);

      const { error } = await supabase.from('faq_entries').insert({
        question: faq.question,
        answer: faq.answer,
        embedding,
        source: 'rifalberta_faq',
      });

      if (error) {
        console.error('❌ Supabase error:', error.message);
      } else {
        console.log('✅ Inserted:', faq.question);
      }
    } catch (err) {
      console.error('❌ Failed:', faq.question);
      console.error(err.message);
    }
  }
}

/* ─────────────────────────────────────────────── */
/* RUN                                            */
/* ─────────────────────────────────────────────── */

insertFAQ()
  .then(() => console.log('🎉 FAQ embedding complete'))
  .catch((err) => console.error('🔥 Script failed:', err));
