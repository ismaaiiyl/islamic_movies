import { api, db } from 'sdk';
import { trackUser } from '../lib/userTracker.js';
import { loadMovies, loadSerials } from '../lib/services.js';
import { searchContent } from '../lib/search.js';
import { sendMovieVideo, sendSerialPartVideo } from '../lib/media.js';
import {
  mainMenu,
  moviesInlineKeyboard,
  serialsInlineKeyboard,
  serialPartsKeyboard,
  searchResultsKeyboard,
} from '../lib/keyboards.js';
import { formatPageText, formatPartsText, escapeHtml } from '../lib/helpers.js';
import { handleStart, handleHelp, handleStat, handleMovies } from '../lib/commands.js';
import { handleAdminCommand, processAdminMessage } from '../lib/admin/adminHandler.js';

export default async function (message, ctx) {
  if (!message || !message.chat) return;

  const chatId = message.chat.id;
  const fromUser = message.from;
  const rawText = message.text || '';
  const text = rawText.trim();

  // 1. Foydalanuvchini bazaga yozish
  if (fromUser) await trackUser(db, fromUser);

  // 2. Admin panel xabarlari (parol, broadcast, kino qo'shish/o'chirish)
  const handledByAdmin = await processAdminMessage(api, db, message);
  if (handledByAdmin) return;

  // 3. /admin buyrug'i
  if (text.startsWith('/admin')) {
    return handleAdminCommand(api, db, chatId, fromUser);
  }

  // 4. /start buyrug'i
  if (text.startsWith('/start')) {
    const match = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?$/i);
    const args = match && match[1] ? match[1].trim() : '';

    if (args) {
      const res = await searchContent(args);
      if (res.type === 'movie') {
        return sendMovieVideo(api, chatId, res.movie, mainMenu);
      }
      if (res.type === 'serial') {
        return api.sendMessage({
          chat_id: chatId,
          text: formatPartsText(res.serial, 0),
          parse_mode: 'HTML',
          reply_markup: serialPartsKeyboard(res.serial.id, 0, 0),
        });
      }
      if (res.type === 'serial_part') {
        return sendSerialPartVideo(api, chatId, res.serial, res.part, mainMenu);
      }

      return api.sendMessage({
        chat_id: chatId,
        text: "❌ <b>Kechirasiz, ushbu havola bo'yicha film topilmadi.</b>\n\nBarcha kinolar ro'yxatini ko'rish uchun quyidagi menyudan foydalanishingiz mumkin:",
        parse_mode: 'HTML',
        reply_markup: mainMenu,
      });
    }

    return handleStart(api, chatId, fromUser);
  }

  // 5. Maxsus buyruqlar
  if (text.startsWith('/help')) return handleHelp(api, chatId);
  if (text === '/stat' || text === '/stats') return handleStat(api, chatId, db);
  if (text.startsWith('/movies')) return handleMovies(api, chatId);

  // 6. Menyudagi tugmalar
  if (text === '🎬 Kinolar') {
    const movies = await loadMovies();
    const kbd = await moviesInlineKeyboard(0);
    return api.sendMessage({
      chat_id: chatId,
      text: formatPageText(movies, 0, "🎬 Kinolar ro'yxati", 10, 'm'),
      parse_mode: 'HTML',
      reply_markup: kbd,
    });
  }

  if (text === '📺 Seriallar') {
    return api.sendMessage({
      chat_id: chatId,
      text: formatPageText(loadSerials(), 0, "📺 Seriallar ro'yxati", 10, 's'),
      parse_mode: 'HTML',
      reply_markup: serialsInlineKeyboard(0),
    });
  }

  if (text.startsWith('/') || !text) return;

  // 7. Qidiruv tizimi (kod, raqam yoki qisman nom)
  const result = await searchContent(text);

  if (result.type === 'movie') {
    return sendMovieVideo(api, chatId, result.movie, mainMenu);
  }

  if (result.type === 'serial') {
    return api.sendMessage({
      chat_id: chatId,
      text: formatPartsText(result.serial, 0),
      parse_mode: 'HTML',
      reply_markup: serialPartsKeyboard(result.serial.id, 0, 0),
    });
  }

  if (result.type === 'serial_part') {
    return sendSerialPartVideo(api, chatId, result.serial, result.part, mainMenu);
  }

  if (result.type === 'multiple') {
    const listText = result.matches
      .map((m, i) => `${i + 1}. ${m.type === 'movie' ? '🎬' : '📺'} <b>${escapeHtml(m.item.title)}</b>`)
      .join('\n');

    return api.sendMessage({
      chat_id: chatId,
      text: `🔍 «<b>${escapeHtml(result.query)}</b>» so'rovi bo'yicha quyidagilar topildi:\n\n${listText}\n\n👇 <i>Kerakli film yoki serialni tanlang:</i>`,
      parse_mode: 'HTML',
      reply_markup: searchResultsKeyboard(result.matches),
    });
  }

  // Hech narsa topilmadi
  return api.sendMessage({
    chat_id: chatId,
    text: "❌ <b>Kechirasiz, bunday nomdagi yoki kodli kino/serial topilmadi.</b>\n\nIltimos, kodi yoki nomini to'g'ri yozganingizni tekshiring (masalan: <code>m1</code> yoki <code>s16</code>).",
    parse_mode: 'HTML',
    reply_markup: mainMenu,
  });
}
