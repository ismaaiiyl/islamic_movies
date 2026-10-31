import { loadMovies, loadSerials, getSerialById } from './services.js';

export const mainMenu = {
  keyboard: [
    [{ text: '🎬 Kinolar' }, { text: '📺 Seriallar' }],
  ],
  resize_keyboard: true,
};

export function getPaginationKeyboard({ items, page = 0, prefix, itemsPerPage = 10, backCallback = null }) {
  const startIdx = page * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageItems = items.slice(startIdx, endIdx);
  const inlineKeyboard = [];
  let currentRow = [];

  pageItems.forEach((item, index) => {
    currentRow.push({ text: String(index + 1), callback_data: `${prefix}_${item.id}_${page}` });
    if (currentRow.length === 5) {
      inlineKeyboard.push(currentRow);
      currentRow = [];
    }
  });
  if (currentRow.length > 0) inlineKeyboard.push(currentRow);

  const navRow = [];
  if (page > 0) navRow.push({ text: '⬅️', callback_data: `${prefix}_page_${page - 1}` });
  navRow.push({ text: `${page + 1}-sahifa`, callback_data: 'ignore' });
  if (endIdx < items.length) navRow.push({ text: '➡️', callback_data: `${prefix}_page_${page + 1}` });
  if (navRow.length > 0) inlineKeyboard.push(navRow);

  if (backCallback) {
    inlineKeyboard.push([{ text: '⬅️ Orqaga', callback_data: backCallback }]);
  }
  return { inline_keyboard: inlineKeyboard };
}

export async function moviesInlineKeyboard(page = 0) {
  const movies = await loadMovies();
  return getPaginationKeyboard({ items: movies, page, prefix: 'movie' });
}

export function serialsInlineKeyboard(page = 0) {
  return getPaginationKeyboard({ items: loadSerials(), page, prefix: 'serial' });
}

// Katta seriallar uchun tezkor sakrash (+50, -50, boshiga, oxiriga) bilan qismlar klaviaturasi
export function serialPartsKeyboard(serialId, partPage = 0, serialPage = 0) {
  const serial = getSerialById(serialId);
  if (!serial || !Array.isArray(serial.parts)) return null;

  const items = serial.parts;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIdx = partPage * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageItems = items.slice(startIdx, endIdx);
  const inlineKeyboard = [];
  let currentRow = [];

  pageItems.forEach((item) => {
    currentRow.push({
      text: String(item.part),
      callback_data: `part_${serialId}_${item.part}_${partPage}_${serialPage}`,
    });
    if (currentRow.length === 5) {
      inlineKeyboard.push(currentRow);
      currentRow = [];
    }
  });
  if (currentRow.length > 0) inlineKeyboard.push(currentRow);

  // Sahifa navigatsiyasi
  const navRow = [];
  if (partPage > 0) navRow.push({ text: '⬅️', callback_data: `serial_parts_page_${serialId}_${partPage - 1}_${serialPage}` });
  navRow.push({ text: `${partPage + 1}/${totalPages}-sahifa`, callback_data: 'ignore' });
  if (endIdx < items.length) navRow.push({ text: '➡️', callback_data: `serial_parts_page_${serialId}_${partPage + 1}_${serialPage}` });
  inlineKeyboard.push(navRow);

  // Katta seriallar uchun tezkor sakrash tugmalari
  if (totalPages >= 3) {
    const jumpRow = [];
    if (partPage > 0) jumpRow.push({ text: '⏮ 1', callback_data: `serial_parts_page_${serialId}_0_${serialPage}` });
    if (partPage >= 5) jumpRow.push({ text: '⏪ -50', callback_data: `serial_parts_page_${serialId}_${partPage - 5}_${serialPage}` });
    if (partPage + 5 < totalPages) jumpRow.push({ text: '+50 ⏩', callback_data: `serial_parts_page_${serialId}_${partPage + 5}_${serialPage}` });
    if (partPage < totalPages - 1) jumpRow.push({ text: `${items.length} ⏭`, callback_data: `serial_parts_page_${serialId}_${totalPages - 1}_${serialPage}` });
    if (jumpRow.length > 0) inlineKeyboard.push(jumpRow);
  }

  inlineKeyboard.push([{ text: '⬅️ Seriallar ro\'yxatiga qaytish', callback_data: `serial_back_${serialPage}` }]);
  return { inline_keyboard: inlineKeyboard };
}

// Qidiruv natijalarini ko'rsatish klaviaturasi
export function searchResultsKeyboard(matches) {
  const inlineKeyboard = matches.map((m) => {
    if (m.type === 'movie') {
      return [{ text: `🎬 ${m.item.title}`, callback_data: `movie_${m.item.id}_0` }];
    }
    return [{ text: `📺 ${m.item.title} (${m.item.parts?.length || 0} qism)`, callback_data: `serial_${m.item.id}_0` }];
  });
  return { inline_keyboard: inlineKeyboard };
}

export function otherBotsKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📢 Barcha kinolar (Kanal)', url: 'https://t.me/islomiy_kinolarim' }],
      [
        { text: "📖 Qur'on Oyatlar Boti", url: 'https://t.me/UzbQuronBot' },
        { text: '✨ Islomiy Duolar Boti', url: 'https://t.me/islomiy_duolar_bot' },
      ],
    ],
  };
}
