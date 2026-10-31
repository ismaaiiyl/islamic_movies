import { buildMovieCaption, buildSerialPartCaption } from './helpers.js';

export async function sendMovieVideo(api, chatId, movie, replyMarkup = null) {
  try {
    // "Video yuborilmoqda..." harakatini ko'rsatish
    await api
      .sendChatAction({
        chat_id: chatId,
        action: 'upload_video',
      })
      .catch(() => {});

    await api.sendVideo({
      chat_id: chatId,
      video: movie.file_id,
      caption: buildMovieCaption(movie),
      parse_mode: 'HTML',
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });
    return true;
  } catch (err) {
    console.error('sendMovieVideo error:', err);
    await api.sendMessage({
      chat_id: chatId,
      text: '❌ <b>Kechirasiz, ushbu video faylini yuborishda xatolik yuz berdi.</b>',
      parse_mode: 'HTML',
    });
    return false;
  }
}

export async function sendSerialPartVideo(api, chatId, serial, part, replyMarkup = null) {
  try {
    // "Video yuborilmoqda..." harakatini ko'rsatish
    await api
      .sendChatAction({
        chat_id: chatId,
        action: 'upload_video',
      })
      .catch(() => {});

    await api.sendVideo({
      chat_id: chatId,
      video: part.file_id,
      caption: buildSerialPartCaption(serial, part),
      parse_mode: 'HTML',
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });
    return true;
  } catch (err) {
    console.error('sendSerialPartVideo error:', err);
    await api.sendMessage({
      chat_id: chatId,
      text: '❌ <b>Kechirasiz, ushbu video faylini yuborishda xatolik yuz berdi.</b>',
      parse_mode: 'HTML',
    });
    return false;
  }
}
