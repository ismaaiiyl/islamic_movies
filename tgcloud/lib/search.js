import {
  loadMovies,
  loadSerials,
  getMovieById,
  getSerialById,
  getSerialPart,
} from './services.js';
import { parseCodeSearch } from './helpers.js';

export async function searchContent(query) {
  if (!query || typeof query !== 'string') {
    return { type: 'not_found', query: '' };
  }
  const clean = query.trim().toLowerCase();

  // 1. Kod bo'yicha qidiruv (masalan: s16e2, s16, m1, movie35)
  const code = parseCodeSearch(clean);

  if (code.type === 'serial_part' && code.id !== null && code.part !== null) {
    const serial = getSerialById(code.id);
    const part = getSerialPart(code.id, code.part);
    if (serial && part) {
      return { type: 'serial_part', serial, part };
    }
  }

  if (code.type === 'movie' && code.id !== null) {
    const movie = await getMovieById(code.id);
    if (movie) return { type: 'movie', movie };
  }

  if (code.type === 'serial' && code.id !== null) {
    const serial = getSerialById(code.id);
    if (serial) return { type: 'serial', serial };
  }

  // 2. Sof raqam kiritilganda (masalan: 16)
  if (/^\d+$/.test(clean)) {
    const targetId = parseInt(clean, 10);
    const movie = await getMovieById(targetId);
    const serial = getSerialById(targetId);

    if (movie && serial) {
      return {
        type: 'multiple',
        query,
        matches: [
          { type: 'movie', item: movie },
          { type: 'serial', item: serial },
        ],
      };
    }
    if (movie) return { type: 'movie', movie };
    if (serial) return { type: 'serial', serial };
  }

  // 3. Qisman nom bo'yicha qidiruv (fuzzy/partial title search)
  const movies = await loadMovies();
  const serials = loadSerials();
  const matches = [];

  for (const m of movies) {
    if (m.title.toLowerCase().includes(clean)) {
      matches.push({ type: 'movie', item: m });
    }
  }
  for (const s of serials) {
    if (s.title.toLowerCase().includes(clean)) {
      matches.push({ type: 'serial', item: s });
    }
  }

  // Aniq 1 ta topilgan bo'lsa
  if (matches.length === 1) {
    if (matches[0].type === 'movie') return { type: 'movie', movie: matches[0].item };
    if (matches[0].type === 'serial') return { type: 'serial', serial: matches[0].item };
  }

  // Bir nechta topilgan bo'lsa
  if (matches.length > 1) {
    const exact = matches.find((m) => m.item.title.toLowerCase() === clean);
    if (exact) {
      if (exact.type === 'movie') return { type: 'movie', movie: exact.item };
      if (exact.type === 'serial') return { type: 'serial', serial: exact.item };
    }

    return {
      type: 'multiple',
      query,
      matches: matches.slice(0, 8),
      total: matches.length,
    };
  }

  return { type: 'not_found', query };
}
