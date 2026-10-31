import { users } from '../schema.js';
import { loadMovies, loadSerials } from './services.js';
import {
  mainMenu,
  otherBotsKeyboard,
} from './keyboards.js';
import { escapeHtml } from './helpers.js';

export const TUTORIAL_VIDEO_FILE_ID =
  'BAACAgQAAxkBAAISsmrmWCGF1aPS-SgfBKswlnS-KD1FAAIqDAACf4M8U0uA0n61S6sZPQQ';

export async function handleStart(api, chatId, fromUser) {
  const userId = fromUser ? fromUser.id : chatId;
  const fullName = fromUser
    ? [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi'
    : 'Foydalanuvchi';

  const welcomeText =
    `<b>Assalomu alaykum, <a href='tg://user?id=${userId}'>${escapeHtml(fullName)}</a>!</b> 👋\n` +
    `────────────────────\n` +
    `✨ <b>Islomiy Kinolar Olami</b>\n\n` +
    `Ushbu bot orqali siz eng sara <b>islomiy filmlar</b> va <b>tarixiy seriallarni</b> ` +
    `yuqori sifatda hamda o'zbek tilida tomosha qilishingiz mumkin. 🎞\n\n` +
    `💡 <i>Botdan foydalanish uchun kino kodini (masalan: <code>m1</code> yoki <code>s16</code>), nomini (masalan: <code>fath</code>, <code>umar</code>) yuboring yoki quyidagi menyudan foydalaning.</i>\n` +
    `────────────────────\n` +
    `👇 <b>Bo'limni tanlang:</b>`;

  await api.sendMessage({
    chat_id: chatId,
    text: welcomeText,
    parse_mode: 'HTML',
    reply_markup: mainMenu,
  });

  const aboutText =
    `<b>Bot haqida qisqacha:</b>\n` +
    `────────────────────\n` +
    `Ushbu bot sizga islomiy ma'rifat ulashish maqsadida yaratilgan. ` +
    `Barcha videolar ochiq manbalardan olingan.\n\n` +
    `🌟 <b>Bizning boshqa foydali loyihalarimiz:</b>`;

  await api.sendMessage({
    chat_id: chatId,
    text: aboutText,
    parse_mode: 'HTML',
    reply_markup: otherBotsKeyboard(),
  });

  const tutorialCaption =
    `🎬 <b>Botdan foydalanish bo'yicha video qo'llanma</b>\n` +
    `────────────────────\n` +
    `Ushbu qisqa videoda bot orqali islomiy kino va seriallarni qanday topish, ` +
    `kodlar orqali yuklash va tomosha qilish batafsil ko'rsatilgan. 💡`;

  await api.sendVideo({
    chat_id: chatId,
    video: TUTORIAL_VIDEO_FILE_ID,
    caption: tutorialCaption,
    parse_mode: 'HTML',
  }).catch((err) => {
    console.error('Failed to send tutorial video in /start:', err);
  });
}

export async function handleHelp(api, chatId) {
  const helpText =
    `<b>Yordam bo'limi</b> 🛠\n` +
    `────────────────────\n` +
    `Botdan samarali foydalanish uchun buyruqlar:\n\n` +
    `💠 /start - <i>Botni ishga tushirish</i>\n` +
    `📂 /movies - <i>Barcha kino va seriallar ro'yxati (kodlari bilan)</i>\n` +
    `📊 /stat - <i>Bot statistikasi</i>\n` +
    `❓ /help - <i>Yordam olish</i>\n\n` +
    `<b>Qo'llanma:</b>\n` +
    `1. Kinolarni ko'rish: <code>m1</code> dan <code>m35</code> gacha kod yuboring.\n` +
    `2. Seriallarni ko'rish: <code>s1</code> dan <code>s19</code> gacha kod yuboring (masalan: <code>s16</code>).\n` +
    `3. Serial qismini to'g'ridan-to'g'ri olish: <code>s16e1</code>, <code>s17e250</code>.\n` +
    `4. Aqlli qidiruv: Qidirayotgan filmingiz nomini yozing (masalan: <code>fath</code>, <code>umar</code>, <code>maryam</code>).\n\n` +
    `📢 <b>Kanalimiz orqali tanlash:</b>\n` +
    `Shuningdek, barcha islomiy kino va seriallarni rasmli afishalari bilan <a href='https://t.me/islomiy_kinolarim'>@islomiy_kinolarim</a> kanalimiz orqali ko'rib chiqishingiz mumkin!\n` +
    `────────────────────\n` +
    `😊 <i>Maroqli hordiq tilaymiz!</i>`;

  await api.sendMessage({
    chat_id: chatId,
    text: helpText,
    parse_mode: 'HTML',
    reply_markup: otherBotsKeyboard(),
  });

  const tutorialCaption =
    `🎬 <b>Botdan foydalanish bo'yicha video qo'llanma</b>\n` +
    `────────────────────\n` +
    `Botdan foydalanish bo'yicha video yo'riqnoma. 💡`;

  await api.sendVideo({
    chat_id: chatId,
    video: TUTORIAL_VIDEO_FILE_ID,
    caption: tutorialCaption,
    parse_mode: 'HTML',
  }).catch((err) => {
    console.error('Failed to send tutorial video in /help:', err);
  });
}

export async function handleStat(api, chatId, db) {
  let userCount = 0;
  try {
    userCount = await db.$count(users);
  } catch (e) {
    console.error('Count users error:', e);
  }

  const allMovies = await loadMovies();
  const statText =
    `📊 <b>Islomiy Kinolar Bot Statistikasi:</b>\n` +
    `────────────────────\n` +
    `👥 Baza foydalanuvchilari soni: <b>${userCount}</b> ta\n` +
    `🎬 Mavjud kinolar: <b>${allMovies.length}</b> ta\n` +
    `📺 Mavjud seriallar: <b>${loadSerials().length}</b> ta (kodlar: <code>s1</code> - <code>s19</code>)\n` +
    `⚡️ Server: <b>Telegram Cloud Serverless</b> (0 latency)\n` +
    `────────────────────`;

  await api.sendMessage({
    chat_id: chatId,
    text: statText,
    parse_mode: 'HTML',
    reply_markup: mainMenu,
  });
}

export async function handleMovies(api, chatId) {
  const movies = await loadMovies();
  const serials = loadSerials();

  let text = "📂 <b>Barcha mavjud kontentlar va kodlar:</b>\n────────────────────\n\n";

  text += "🎬 <b>Kinolar ro'yxati (m1 - m35):</b>\n";
  movies.forEach((m) => {
    text += `• <code>m${m.id}</code> — <b>${escapeHtml(m.title)}</b>\n`;
  });

  text += "\n📺 <b>Seriallar ro'yxati (s1 - s19):</b>\n";
  serials.forEach((s) => {
    const partsCount = (s.parts || []).length;
    text += `• <code>s${s.id}</code> — <b>${escapeHtml(s.title)}</b> (<i>${partsCount} qism</i>)\n`;
  });

  text += "\n────────────────────\n";
  text += "💡 <i>Kod ustiga bossangiz (masalan: <code>s16</code> yoki <code>m1</code>), nusxa olinadi. Uni botga yuborsangiz o'sha filmni olasiz!</i>\n";
  text += "🔗 <i>To'g'ridan-to'g'ri havola: <code>https://t.me/Islomiy_kinolar_bot?start=s16</code></i>";

  await api.sendMessage({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  });

  const channelText =
    `✨ <b>Kanalimiz orqali tanlash va tomosha qilish:</b>\n` +
    `────────────────────\n` +
    `Barcha islomiy kino va seriallarni rasmli afishalari hamda qisqacha mazmuni bilan ` +
    `<a href='https://t.me/islomiy_kinolarim'>@islomiy_kinolarim</a> kanalimiz orqali tanlab, ` +
    `bir bosishda tomosha qilishingiz ham mumkin! 🎬`;

  await api.sendMessage({
    chat_id: chatId,
    text: channelText,
    parse_mode: 'HTML',
  });
}
