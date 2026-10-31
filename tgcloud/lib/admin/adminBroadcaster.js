import { users } from '../../schema.js';
import { adminBroadcastConfirmKeyboard, adminPostActionKeyboard } from './adminKeyboards.js';

export async function prepareBroadcastPreview(api, db, adminChatId, message) {
  let userCount = 0;
  try {
    userCount = await db.$count(users);
  } catch {
    const list = await db.select().from(users).all().catch(() => []);
    userCount = list.length;
  }

  // 1. Xabarning nusxasini adminga ko'rsatish
  try {
    await api.copyMessage({
      chat_id: adminChatId,
      from_chat_id: adminChatId,
      message_id: message.message_id,
    });
  } catch (err) {
    console.error('Broadcast copy preview error:', err);
  }

  // 2. Tasdiqlash so'rovi
  const confirmText =
    `👆 <b>Xabar ko'rinishi (Preview)</b>\n\n` +
    `👥 Qabul qiluvchilar: <b>${userCount}</b> ta foydalanuvchi\n\n` +
    `Ushbu xabarni barcha foydalanuvchilarga yuborishni tasdiqlaysizmi?`;

  await api.sendMessage({
    chat_id: adminChatId,
    text: confirmText,
    parse_mode: 'HTML',
    reply_markup: adminBroadcastConfirmKeyboard,
  });
}

export async function executeBroadcast(api, db, adminChatId, targetMessageId) {
  let userList = [];
  try {
    userList = await db.select().from(users).all();
  } catch (err) {
    console.error('executeBroadcast get users error:', err);
    await api.sendMessage({
      chat_id: adminChatId,
      text: "❌ Foydalanuvchilar ro'yxatini olishda xatolik yuz berdi.",
      reply_markup: adminPostActionKeyboard('broadcast'),
    });
    return;
  }

  const total = userList.length;
  if (total === 0) {
    await api.sendMessage({
      chat_id: adminChatId,
      text: 'ℹ️ Bazada hali foydalanuvchilar mavjud emas.',
      reply_markup: adminPostActionKeyboard('broadcast'),
    });
    return;
  }

  const startTime = Date.now();
  let sent = 0;
  let blocked = 0;
  let skipped = 0;

  for (const u of userList) {
    const targetChatId = Number(u.tgId);

    // 1. Agar ID yaroqsiz bo'lsa darhol skip qilamiz
    if (!targetChatId || isNaN(targetChatId) || targetChatId <= 0) {
      skipped++;
      continue;
    }

    try {
      await api.copyMessage({
        chat_id: targetChatId,
        from_chat_id: adminChatId,
        message_id: targetMessageId,
      });
      sent++;
    } catch (err) {
      const errMsg = (err?.description || err?.message || '').toLowerCase();
      // 2. Bot bloklangan yoki hisob o'chirilgan bo'lsa
      if (errMsg.includes('blocked') || errMsg.includes('deactivated') || err?.error_code === 403) {
        blocked++;
      } else {
        // 3. Chat topilmasa yoki boshqa sabab bo'lsa
        skipped++;
      }
      continue;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const resultText =
    `✅ <b>Xabar tarqatish muvaffaqiyatli yakunlandi!</b>\n\n` +
    `👥 Jami foydalanuvchilar: <b>${total}</b> ta\n` +
    `✅ Yetkazildi: <b>${sent}</b> ta\n` +
    `🚫 Botni bloklaganlar: <b>${blocked}</b> ta\n` +
    `⚠️ Topilmagan / o'chirilgan: <b>${skipped}</b> ta\n` +
    `⏱ Sarflangan vaqt: <b>${duration} soniya</b>`;

  await api.sendMessage({
    chat_id: adminChatId,
    text: resultText,
    parse_mode: 'HTML',
    reply_markup: adminPostActionKeyboard('broadcast'),
  });
}
