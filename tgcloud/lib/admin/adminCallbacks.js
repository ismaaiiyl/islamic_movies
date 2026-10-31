import { getAdminState, setAdminState, logoutAdmin } from './adminAuth.js';
import { adminMainMenu, adminContentMenu, adminCancelKeyboard } from './adminKeyboards.js';
import { executeBroadcast } from './adminBroadcaster.js';
import { loadMovies, loadSerials } from '../services.js';
import { users } from '../../schema.js';

async function safeEditOrSend(api, chatId, messageId, text, replyMarkup) {
  try {
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      ...(replyMarkup ? { reply_markup: replyMarkup } : { reply_markup: { inline_keyboard: [] } }),
    });
  } catch (err) {
    if (!err.description?.includes('message is not modified')) {
      await api.sendMessage({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }).catch(() => {});
    }
  }
}

export async function processAdminCallback(api, db, callbackQuery) {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message?.chat?.id;
  const messageId = callbackQuery.message?.message_id;
  const fromId = callbackQuery.from?.id;
  const qId = callbackQuery.id;

  if (!chatId || !fromId) return false;

  const adminState = await getAdminState(db, fromId);
  if (data !== 'admin_cancel' && !adminState.isAuthenticated) {
    await api.answerCallbackQuery({ callback_query_id: qId, text: 'Avval /admin orqali kiring!' }).catch(() => {});
    return true;
  }

  // Callback loading aylanasi darhol to'xtashi uchun
  await api.answerCallbackQuery({ callback_query_id: qId }).catch(() => {});

  if (data === 'admin_menu' || data === 'admin_cancel') {
    await setAdminState(db, fromId, { state: 'idle', tempData: null });
    await safeEditOrSend(api, chatId, messageId, "👑 <b>Admin Paneli</b>\n\nBo'limni tanlang:", adminMainMenu);
    return true;
  }

  if (data === 'admin_stat') {
    let userCount = 0;
    try {
      userCount = await db.$count(users);
    } catch {
      const list = await db.select().from(users).all().catch(() => []);
      userCount = list.length;
    }

    const movies = await loadMovies();
    const serials = loadSerials();

    const statText =
      `📊 <b>Admin Statistikasi:</b>\n` +
      `────────────────────\n` +
      `👥 Foydalanuvchilar: <b>${userCount}</b> ta\n` +
      `🎬 Mavjud kinolar: <b>${movies.length}</b> ta\n` +
      `📺 Seriallar soni: <b>${serials.length}</b> ta (759 qism)\n` +
      `⚡️ Server: <b>Telegram Cloud Serverless</b>\n` +
      `⏱ Tezlik: <b>~10ms</b> (0ms cold-start)\n` +
      `────────────────────`;

    const statKeyboard = {
      inline_keyboard: [
        [{ text: '🔄 Yangilash', callback_data: 'admin_stat' }],
        [{ text: '⬅️ Asosiy menyu', callback_data: 'admin_menu' }],
      ],
    };

    await safeEditOrSend(api, chatId, messageId, statText, statKeyboard);
    return true;
  }

  if (data === 'admin_broadcast') {
    await setAdminState(db, fromId, { state: 'awaiting_broadcast' });
    const msg =
      `📢 <b>Xabar tarqatish:</b>\n\n` +
      `Barcha foydalanuvchilarga yubormoqchi bo'lgan xabaringizni yuboring (matn, rasm, video, audio, ovoz, fayl):`;
    await safeEditOrSend(api, chatId, messageId, msg, adminCancelKeyboard('admin_menu'));
    return true;
  }

  if (data === 'admin_broadcast_cancel') {
    await setAdminState(db, fromId, { state: 'idle', tempData: null });
    await safeEditOrSend(
      api,
      chatId,
      messageId,
      '❌ <b>Xabar tarqatish bekor qilindi.</b>',
      { inline_keyboard: [[{ text: '👑 Admin menyusi', callback_data: 'admin_menu' }]] }
    );
    return true;
  }

  if (data === 'admin_broadcast_send') {
    const targetMsgId = adminState.tempData?.targetMessageId;
    if (!targetMsgId) {
      await safeEditOrSend(
        api,
        chatId,
        messageId,
        '⚠️ <b>Xabar topilmadi yoki muddati o\'tgan.</b> Qaytadan urinib ko\'ring.',
        adminMainMenu
      );
      return true;
    }

    await setAdminState(db, fromId, { state: 'idle', tempData: null });
    await safeEditOrSend(api, chatId, messageId, '⏳ <b>Xabar tarqatilmoqda... Iltimos, kuting...</b>');
    await executeBroadcast(api, db, chatId, targetMsgId);
    return true;
  }

  if (data === 'admin_content') {
    await setAdminState(db, fromId, { state: 'idle', tempData: null });
    await safeEditOrSend(
      api,
      chatId,
      messageId,
      "🎬 <b>Kontent boshqaruvi:</b>\n\nKino qo'shish yoki o'chirishni tanlang:",
      adminContentMenu
    );
    return true;
  }

  if (data === 'admin_add_movie') {
    await setAdminState(db, fromId, { state: 'awaiting_movie_title' });
    const msg = "📝 <b>Yangi kino nomini kiriting:</b>\n\nMasalan: <i>Yusuf alayhissalom</i>";
    await safeEditOrSend(api, chatId, messageId, msg, adminCancelKeyboard('admin_content'));
    return true;
  }

  if (data === 'admin_del_movie') {
    await setAdminState(db, fromId, { state: 'awaiting_movie_delete' });
    const msg = "🗑 <b>O'chirmoqchi bo'lgan kino kodini yozing:</b>\n\nMasalan: <code>m4</code> yoki <code>4</code>";
    await safeEditOrSend(api, chatId, messageId, msg, adminCancelKeyboard('admin_content'));
    return true;
  }

  if (data === 'admin_logout') {
    await logoutAdmin(db, fromId);
    await safeEditOrSend(
      api,
      chatId,
      messageId,
      '🚪 <b>Admin panelidan chiqildi.</b>\nQayta kirish uchun: /admin'
    );
    return true;
  }

  return false;
}
