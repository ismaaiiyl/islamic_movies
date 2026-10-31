import { db } from 'sdk';
import { movies as baseMovies, serials } from './data.js';
import { customMovies, deletedMovies } from '../schema.js';

export async function loadMovies() {
  let deletedSet = new Set();
  let customList = [];

  try {
    const delRows = await db.select().from(deletedMovies).all();
    deletedSet = new Set((delRows || []).map((r) => Number(r.movieId)));
  } catch (e) {
    console.error('loadMovies deletedMovies error:', e);
  }

  try {
    const custRows = await db.select().from(customMovies).all();
    customList = (custRows || []).map((r) => ({
      id: 35 + Number(r.id),
      title: r.title,
      caption: r.caption || '',
      file_id: r.fileId,
      category: 'Islomiy',
      language: 'Uzbek tilida',
    }));
  } catch (e) {
    console.error('loadMovies customMovies error:', e);
  }

  const combined = [...baseMovies, ...customList];
  return combined.filter((m) => !deletedSet.has(Number(m.id)));
}

export function loadSerials() {
  return serials;
}

export async function getMovieById(id) {
  if (id === null || id === undefined) return null;
  const list = await loadMovies();
  return list.find((m) => Number(m.id) === Number(id)) ?? null;
}

export async function getMovieByTitle(title) {
  if (!title || typeof title !== 'string') return null;
  const clean = title.toLowerCase().trim();
  const list = await loadMovies();
  return list.find((m) => m.title.toLowerCase().trim() === clean) ?? null;
}

export function getSerialById(id) {
  if (id === null || id === undefined) return null;
  return serials.find((s) => Number(s.id) === Number(id)) ?? null;
}

export function getSerialByTitle(title) {
  if (!title || typeof title !== 'string') return null;
  const clean = title.toLowerCase().trim();
  return serials.find((s) => s.title.toLowerCase().trim() === clean) ?? null;
}

export function getSerialPart(serialId, partNumber) {
  const serial = getSerialById(serialId);
  if (!serial || !Array.isArray(serial.parts)) return null;
  return serial.parts.find((p) => Number(p.part) === Number(partNumber)) ?? null;
}
