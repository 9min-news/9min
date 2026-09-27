/**
 * Corpus analysis script for 9min.ch medienkritik articles.
 * Reads src/data/metadata.json and outputs statistics for quarterly and full-corpus analysis.
 *
 * Usage:
 *   npx tsx scripts/analyze-corpus.ts
 *   npx tsx scripts/analyze-corpus.ts --quarter 2026-Q2
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface Article {
  slug: string;
  title: string;
  date: string;
  type: string;
  categories?: string[];
  themen?: string[];
  tags?: string[];
  kritisiertes_medium?: string;
  kritik_typ?: string[];
  kritik_schwere?: number;
  personen?: string[];
  institutionen?: string[];
  gesetze_vorlagen?: string[];
  these?: string;
  zusammenfassung?: string;
  quelle_format?: string;
  quelle_sendung?: string;
  quelle_redaktion?: string;
  quelle_datum?: string;
}

function count<T extends string>(items: T[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    result[item] = (result[item] ?? 0) + 1;
  }
  return result;
}

function sorted(obj: Record<string, number>): [string, number][] {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function banner(title: string) {
  const line = '═'.repeat(title.length + 4);
  console.log(`\n╔${line}╗`);
  console.log(`║  ${title}  ║`);
  console.log(`╚${line}╝`);
}

function section(title: string) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 60 - title.length - 4))}`);
}

function printTop(obj: Record<string, number>, n = 15) {
  sorted(obj).slice(0, n).forEach(([k, v]) => {
    const bar = '█'.repeat(Math.round(v / Math.max(...Object.values(obj)) * 20));
    console.log(`  ${String(v).padStart(4)}  ${bar.padEnd(20)} ${k}`);
  });
}

const metadataPath = join(process.cwd(), 'src/data/metadata.json');
const all: Article[] = JSON.parse(readFileSync(metadataPath, 'utf-8'));

const medienkritik = all.filter(a => a.type === 'medienkritik');

// Quarter filter
const quarterArg = process.argv.find(a => a.startsWith('--quarter='))?.split('=')[1];
const [qYear, qQ] = quarterArg?.split('-') ?? [];
const qNum = qQ ? parseInt(qQ.replace('Q', '')) : null;
const qStart = qNum ? `${qYear}-${String((qNum - 1) * 3 + 1).padStart(2, '0')}-01` : null;
const qEnd = qNum ? `${qYear}-${String(qNum * 3).padStart(2, '0')}-30` : null;

function analyzeSet(articles: Article[], label: string) {
  banner(label);

  // Date range
  const dates = articles.map(a => a.date).sort();
  console.log(`\n  Articles: ${articles.length}`);
  console.log(`  Date range: ${dates[0]} → ${dates[dates.length - 1]}`);

  // Monthly distribution
  section('Monthly distribution');
  const byMonth = count(articles.map(a => a.date.slice(0, 7)));
  sorted(byMonth).forEach(([m, v]) => console.log(`  ${m}  ${String(v).padStart(4)}  ${'▪'.repeat(v)}`));

  // Kritik severity
  section('Kritik severity (kritik_schwere)');
  const schwere = count(articles.map(a => String(a.kritik_schwere ?? 'n/a')));
  sorted(schwere).forEach(([k, v]) => console.log(`  Schwere ${k}: ${v} (${Math.round(v / articles.length * 100)}%)`));

  // Kritik types
  section('Kritik types (kritik_typ)');
  const ktyps = count(articles.flatMap(a => a.kritik_typ ?? []));
  printTop(ktyps);

  // Categories
  section('Categories');
  const cats = count(articles.flatMap(a => a.categories ?? []));
  printTop(cats);

  // Media criticized
  section('Kritisiertes Medium (top 20)');
  const media = count(articles.map(a => a.kritisiertes_medium ?? 'unbekannt').filter(Boolean));
  printTop(media, 20);

  // Source format
  section('Quelle Format');
  const formats = count(articles.map(a => a.quelle_format ?? 'n/a').filter(s => s !== 'n/a'));
  printTop(formats);

  // Source Sendung
  section('Quelle Sendung (top 20)');
  const sendungen = count(articles.map(a => a.quelle_sendung ?? '').filter(Boolean));
  printTop(sendungen, 20);

  // Top persons
  section('Top Personen (top 20)');
  const personen = count(articles.flatMap(a => a.personen ?? []));
  printTop(personen, 20);

  // Top institutions
  section('Top Institutionen (top 20)');
  const institutionen = count(articles.flatMap(a => a.institutionen ?? []));
  printTop(institutionen, 20);

  // Top laws/proposals
  section('Gesetze & Vorlagen (top 15)');
  const gesetze = count(articles.flatMap(a => a.gesetze_vorlagen ?? []));
  printTop(gesetze, 15);

  // Schwere-3 articles
  const schwere3 = articles.filter(a => a.kritik_schwere === 3);
  section(`Schwere-3 articles (${schwere3.length})`);
  schwere3.sort((a, b) => a.date.localeCompare(b.date)).forEach(a => {
    console.log(`\n  [${a.date}] ${a.title}`);
    if (a.kritisiertes_medium) console.log(`  Medium: ${a.kritisiertes_medium}`);
    if (a.kritik_typ?.length) console.log(`  Typ: ${a.kritik_typ.join(', ')}`);
    if (a.these) console.log(`  These: ${a.these}`);
  });

  // Themen
  section('Themen (top 25)');
  const themen = count(articles.flatMap(a => a.themen ?? []));
  printTop(themen, 25);
}

// Full corpus analysis
analyzeSet(medienkritik, `FULL CORPUS — ${medienkritik.length} medienkritik articles`);

// Q2 2026
const q2 = medienkritik.filter(a => a.date >= '2026-04-01' && a.date <= '2026-06-30');
analyzeSet(q2, `Q2 2026 — April–June 2026`);

// Q1 2026 (for comparison)
const q1 = medienkritik.filter(a => a.date >= '2026-01-01' && a.date <= '2026-03-31');
if (q1.length > 0) analyzeSet(q1, `Q1 2026 — January–March 2026`);

// Custom quarter if requested
if (qStart && qEnd) {
  const custom = medienkritik.filter(a => a.date >= qStart && a.date <= qEnd);
  analyzeSet(custom, `${quarterArg} — ${custom.length} articles`);
}
