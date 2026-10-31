import { customMovies, deletedMovies } from '../../schema.js';
import { loadMovies } from '../services.js';

export async function saveNewMovie(db, title, mediaMessage) {
  if (!mediaMessage) {
    return { success: false, message: 'Iltimos, video fayl yuboring.' };
  }

  const fileId = mediaMessage.video?.file_id || mediaMessage.document?.file_id;
  if (!fileId) {
    return { success: false, message: 'Iltimos, video yoki kino faylini yuboring.' };
  }

  const caption = mediaMessage.caption || '';

  try {
    const inserted = await db
      .insert(customMovies)
      .values({
        title: title.trim(),
        caption: caption.trim(),
        fileId,
        createdAt: new Date(),
      })
      .returning({ id: customMovies.id });

    const newRowId = inserted && inserted[0] ? inserted[0].id : 1;
    const publicMovieId = 35 + Number(newRowId);

    return {
      success: true,
      movieId: publicMovieId,
      code: `m${publicMovieId}`,
      title: title.trim(),
    };
  } catch (err) {
    console.error('saveNewMovie error:', err);
    return { success: false, message: 'Kinoni bazaga saqlashda xatolik yuz berdi.' };
  }
}

export async function deleteMovieByCode(db, inputCode) {
  if (!inputCode || typeof inputCode !== 'string') {
    return { success: false, message: "Noto'g'ri kod formati." };
  }

  const clean = inputCode.trim().toLowerCase();
  const match = clean.match(/^(?:m|movie)?(\d+)$/);
  if (!match) {
    return { success: false, message: "Noto'g'ri kod. Masalan: <code>m4</code> yoki <code>4</code> deb kiriting." };
  }

  const targetId = parseInt(match[1], 10);
  const allMovies = await loadMovies();
  const movie = allMovies.find((m) => Number(m.id) === targetId);

  if (!movie) {
    return { success: false, message: `«m${targetId}» kodli kino topilmadi yoki allaqachon o'chirilgan.` };
  }

  try {
    await db
      .insert(deletedMovies)
      .values({
        movieId: targetId,
        deletedAt: new Date(),
      })
      .onConflictDoNothing({ target: deletedMovies.movieId })
      .run();

    return {
      success: true,
      movieId: targetId,
      code: `m${targetId}`,
      title: movie.title,
    };
  } catch (err) {
    console.error('deleteMovieByCode error:', err);
    return { success: false, message: "Kinoni o'chirishda xatolik yuz berdi." };
  }
}
