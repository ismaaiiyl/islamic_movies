import { getAdminState, setAdminState, isCorrectPassword } from './adminAuth.js';
import { adminMainMenu, adminCancelKeyboard, adminPostActionKeyboard } from './adminKeyboards.js';
import { prepareBroadcastPreview } from './adminBroadcaster.js';
import { saveNewMovie, deleteMovieByCode } from './adminContent.js';
import { escapeHtml } from '../helpers.js';

export { processAdminCallback } from './adminCallbacks.js';

export async function handleAdminCommand(api, db, chatId, fromUser) {
  if (!fromUser) return;
  const adminState = await getAdminState(db, fromUser.id);

  if (adminState.isAuthenticated) {
    await setAdminState(db, fromUser.id, { state: 'idle', tempData: null });
    return api.sendMessage({
      chat_id: chatId,
      text: "👑 <b>Admin Paneli</b>\n\nQuyidagi bo'limlardan birini tanlang:",
      parse_mode: 'HTML',
      reply_markup: adminMainMenu,
    });
  }

  await setAdminState(db, fromUser.id, { state: 'awaiting_password' });
  return api.sendMessage({
    chat_id: chatId,
    text: '🔐 <b>Admin paneliga kirish:</b>\n\nIltimos, admin parolini kiriting:',
    parse_mode: 'HTML',
    reply_markup: adminCancelKeyboard('admin_cancel'),
  });
}

export async function processAdminMessage(api, db, message) {
  if (!message || !message.from) return false;
  const fromId = message.from.id;
  const chatId = message.chat.id;
  const adminState = await getAdminState(db, fromId);

  // 1. Parol tekshirish
  if (adminState.state === 'awaiting_password') {
    if (isCorrectPassword(message.text)) {
      await setAdminState(db, fromId, { isAuthenticated: true, state: 'idle', tempData: null });
      await api.sendMessage({
        chat_id: chatId,
        text: "✅ <b>Parol to'g'ri! Xush kelibsiz, Admin.</b>\n\nAdmin paneli boshqaruvi ochildi:",
        parse_mode: 'HTML',
        reply_markup: adminMainMenu,
      });
    } else {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ <b>Parol noto'g'ri!</b>\nIltimos, parolni qaytadan kiriting:",
        parse_mode: 'HTML',
        reply_markup: adminCancelKeyboard('admin_cancel'),
      });
    }
    return true;
  }

  if (!adminState.isAuthenticated) return false;

  // 2. Broadcast xabarini qabul qilish va Preview tayyorlash
  if (adminState.state === 'awaiting_broadcast') {
    await setAdminState(db, fromId, {
      state: 'awaiting_broadcast_confirm',
      tempData: { targetMessageId: message.message_id },
    });
    await prepareBroadcastPreview(api, db, chatId, message);
    return true;
  }

  // 3. Yangi kino nomi kiritilganda
  if (adminState.state === 'awaiting_movie_title') {
    const title = (message.text || '').trim();
    if (!title) {
      await api.sendMessage({
        chat_id: chatId,
        text: "⚠️ Iltimos, kino nomini matn ko'rinishida yozing:",
        parse_mode: 'HTML',
        reply_markup: adminCancelKeyboard('admin_content'),
      });
      return true;
    }

    await setAdminState(db, fromId, { state: 'awaiting_movie_video', tempData: { title } });
    await api.sendMessage({
      chat_id: chatId,
      text:
        `🎬 <b>«${escapeHtml(title)}»</b> filmi uchun videoni yuboring:\n\n` +
        `💡 <i>Videoga yozilgan izoh (caption) avtomatik saqlanadi va film chiqarilganda shu izoh bilan yuboriladi.</i>`,
      parse_mode: 'HTML',
      reply_markup: adminCancelKeyboard('admin_content'),
    });
    return true;
  }

  // 4. Yangi kino videosi yoki fayli yuborilganda
  if (adminState.state === 'awaiting_movie_video') {
    const hasMedia = Boolean(message.video || message.document);
    if (!hasMedia) {
      await api.sendMessage({
        chat_id: chatId,
        text: '⚠️ Iltimos, video yoki film faylini yuboring (matn yoki rasm emas):',
        parse_mode: 'HTML',
        reply_markup: adminCancelKeyboard('admin_content'),
      });
      return true;
    }

    const title = adminState.tempData?.title || 'Nomsiz film';
    const res = await saveNewMovie(db, title, message);

    if (res.success) {
      await setAdminState(db, fromId, { state: 'idle', tempData: null });
      const successText =
        `✅ <b>Kino muvaffaqiyatli qo'shildi!</b>\n\n` +
        `🎬 Nomi: <b>${escapeHtml(res.title)}</b>\n` +
        `🆔 Kodi: <code>${res.code}</code>\n` +
        `🔗 Havola: <code>https://t.me/Islomiy_kinolar_bot?start=${res.code}</code>\n\n` +
        `💡 <i>Ushbu havola orqali foydalanuvchilar to'g'ridan-to'g'ri filmni ko'rishlari mumkin.</i>`;

      await api.sendMessage({
        chat_id: chatId,
        text: successText,
        parse_mode: 'HTML',
        reply_markup: adminPostActionKeyboard('add_movie'),
      });
    } else {
      await api.sendMessage({
        chat_id: chatId,
        text: `❌ ${res.message}`,
        parse_mode: 'HTML',
        reply_markup: adminPostActionKeyboard('content'),
      });
    }
    return true;
  }

  // 5. Kino o'chirish kodi kiritilganda
  if (adminState.state === 'awaiting_movie_delete') {
    const res = await deleteMovieByCode(db, (message.text || '').trim());
    if (res.success) {
      await setAdminState(db, fromId, { state: 'idle', tempData: null });
      await api.sendMessage({
        chat_id: chatId,
        text: `✅ <b>«${escapeHtml(res.title)}» (${res.code}) muvaffaqiyatli o'chirildi!</b>`,
        parse_mode: 'HTML',
        reply_markup: adminPostActionKeyboard('del_movie'),
      });
    } else {
      await api.sendMessage({
        chat_id: chatId,
        text: `❌ ${res.message}`,
        parse_mode: 'HTML',
        reply_markup: adminCancelKeyboard('admin_content'),
      });
    }
    return true;
  }

  return false;
}
