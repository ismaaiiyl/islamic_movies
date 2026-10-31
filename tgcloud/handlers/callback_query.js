import { api, db } from 'sdk';
import {
  loadMovies,
  loadSerials,
  getMovieById,
  getSerialById,
  getSerialPart,
} from '../lib/services.js';
import {
  moviesInlineKeyboard,
  serialsInlineKeyboard,
  serialPartsKeyboard,
} from '../lib/keyboards.js';
import { formatPageText, formatPartsText } from '../lib/helpers.js';
import { sendMovieVideo, sendSerialPartVideo } from '../lib/media.js';
import { processAdminCallback } from '../lib/admin/adminHandler.js';

async function safeEdit(params) {
  try {
    await api.editMessageText(params);
  } catch (err) {
    if (!err.description?.includes('message is not modified')) {
      console.error('safeEdit error:', err);
    }
  }
}

export default async function (callbackQuery, ctx) {
  if (!callbackQuery) return;

  const qId = callbackQuery.id;
  const data = callbackQuery.data || '';
  const message = callbackQuery.message;

  if (!message || !message.chat) {
    if (qId) await api.answerCallbackQuery({ callback_query_id: qId }).catch(() => {});
    return;
  }

  const chatId = message.chat.id;
  const messageId = message.message_id;

  try {
    // 1. Admin panel callbacklari
    if (data.startsWith('admin_')) {
      return processAdminCallback(api, db, callbackQuery);
    }

    // 2. E'tiborsiz qoldiriladigan tugma
    if (data === 'ignore') {
      return api.answerCallbackQuery({ callback_query_id: qId });
    }

    // 3. Kinolar sahifasi
    if (data.startsWith('movie_page_')) {
      const page = parseInt(data.split('_')[2], 10) || 0;
      const movies = await loadMovies();
      const kbd = await moviesInlineKeyboard(page);
      await safeEdit({
        chat_id: chatId,
        message_id: messageId,
        text: formatPageText(movies, page, "🎬 Kinolar ro'yxati", 10, 'm'),
        parse_mode: 'HTML',
        reply_markup: kbd,
      });
      return api.answerCallbackQuery({ callback_query_id: qId });
    }

    // 4. Kino yuborish
    if (data.startsWith('movie_')) {
      const movieId = parseInt(data.split('_')[1], 10);
      const movie = await getMovieById(movieId);
      if (movie) {
        await sendMovieVideo(api, chatId, movie);
      }
      return api.answerCallbackQuery({ callback_query_id: qId });
    }

    // 5. Seriallar sahifasi
    if (data.startsWith('serial_page_')) {
      const page = parseInt(data.split('_')[2], 10) || 0;
      await safeEdit({
        chat_id: chatId,
        message_id: messageId,
        text: formatPageText(loadSerials(), page, "📺 Seriallar ro'yxati", 10, 's'),
        parse_mode: 'HTML',
        reply_markup: serialsInlineKeyboard(page),
      });
      return api.answerCallbackQuery({ callback_query_id: qId });
    }

    // 6. Serial qismlari sahifasi
    if (data.startsWith('serial_parts_page_')) {
      const parts = data.split('_');
      const serialId = parseInt(parts[3], 10);
      const partPage = parseInt(parts[4], 10) || 0;
      const serialPage = parseInt(parts[5], 10) || 0;

      const serial = getSerialById(serialId);
      if (serial) {
        await safeEdit({
          chat_id: chatId,
          message_id: messageId,
          text: formatPartsText(serial, partPage),
          parse_mode: 'HTML',
          reply_markup: serialPartsKeyboard(serialId, partPage, serialPage),
        });
      }
      return api.answerCallbackQuery({ callback_query_id: qId });
    }

    // 7. Serial qismlaridan seriallar ro'yxatiga qaytish
    if (data.startsWith('serial_back_')) {
      const page = parseInt(data.split('_')[2], 10) || 0;
      await safeEdit({
        chat_id: chatId,
        message_id: messageId,
        text: formatPageText(loadSerials(), page, "📺 Seriallar ro'yxati", 10, 's'),
        parse_mode: 'HTML',
        reply_markup: serialsInlineKeyboard(page),
      });
      return api.answerCallbackQuery({ callback_query_id: qId });
    }

    // 8. Serial tanlanganda (qismlar menyusini ochish)
    if (data.startsWith('serial_')) {
      const parts = data.split('_');
      const serialId = parseInt(parts[1], 10);
      const serialPage = parts.length > 2 ? parseInt(parts[2], 10) || 0 : 0;

      const serial = getSerialById(serialId);
      if (serial) {
        await safeEdit({
          chat_id: chatId,
          message_id: messageId,
          text: formatPartsText(serial, 0),
          parse_mode: 'HTML',
          reply_markup: serialPartsKeyboard(serialId, 0, serialPage),
        });
      }
      return api.answerCallbackQuery({ callback_query_id: qId });
    }

    // 9. Serial qismini yuborish
    if (data.startsWith('part_')) {
      const parts = data.split('_');
      const serialId = parseInt(parts[1], 10);
      const partNumber = parseInt(parts[2], 10);

      const serial = getSerialById(serialId);
      const part = getSerialPart(serialId, partNumber);
      if (serial && part) {
        await sendSerialPartVideo(api, chatId, serial, part);
      }
      return api.answerCallbackQuery({ callback_query_id: qId });
    }

    await api.answerCallbackQuery({ callback_query_id: qId });
  } catch (err) {
    console.error('CallbackQuery global error:', err);
    if (qId) await api.answerCallbackQuery({ callback_query_id: qId }).catch(() => {});
  }
}
