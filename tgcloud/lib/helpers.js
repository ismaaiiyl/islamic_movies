export function formatPageText(items, page = 0, totalTitle = 'Kinolar', itemsPerPage = 10, prefix = '') {
  const startIdx = page * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageItems = items.slice(startIdx, endIdx);

  let text = `<b>${totalTitle}</b> (Sahifa ${page + 1}):\n`;
  text += '────────────────────\n\n';
  pageItems.forEach((item, index) => {
    const codeTag = prefix ? `<code>${prefix}${item.id}</code> — ` : '';
    const partsCount = item.parts ? ` (<i>${item.parts.length} qism</i>)` : '';
    text += `${index + 1}. ${codeTag}<b>${item.title}</b>${partsCount}\n`;
  });
  text += '\n👇 <b>Quyidagi tugmalardan tanlang yoki kodini yuboring (masalan: <code>' + (prefix || 'm') + (pageItems[0]?.id || 1) + '</code>):</b>';
  return text;
}

export function formatPartsText(serial, page = 0, itemsPerPage = 10) {
  const parts = serial.parts || [];
  const totalParts = parts.length;
  const totalPages = Math.ceil(totalParts / itemsPerPage) || 1;

  let text = `📺 <b>${serial.title}</b>\n`;
  text += '────────────────────\n';
  if (serial.year) text += `📅 <b>Yili:</b> ${serial.year}\n`;
  if (serial.category) text += `🏷 <b>Kategoriya:</b> ${serial.category}\n`;
  if (serial.language) text += `🌐 <b>Til:</b> ${serial.language}\n`;
  text += `🎞 <b>Jami qismlar:</b> ${totalParts} ta\n`;
  text += `🆔 <b>Kodi:</b> <code>s${serial.id}</code>\n`;

  const about = serial.caption || serial.description || serial.about;
  if (about) {
    text += `\n📝 <b>Haqida:</b>\n${about}\n`;
  }
  text += '────────────────────\n';
  text += `👇 <b>Tomosha qilmoqchi bo'lgan qism raqamini tanlang</b> (Sahifa ${page + 1}/${totalPages}):\n`;
  const samplePart = totalParts > 10 ? 25 : Math.min(totalParts, 2);
  text += `💡 <i>Istalgan qismni to'g'ridan-to'g'ri olish uchun botga kodini yozing: masalan <code>s${serial.id}e${samplePart}</code></i>`;
  return text;
}

export function buildMovieCaption(movie) {
  let caption = `🎬 <b>${movie.title}</b>\n`;
  if (movie.year) caption += `📅 Yili: ${movie.year}\n`;
  if (movie.duration) caption += `⏳ Davomiyligi: ${movie.duration}\n`;
  if (movie.language) caption += `🌐 Til: ${movie.language}\n`;
  caption += `🆔 Kodi: <code>m${movie.id}</code>\n`;
  if (movie.caption) caption += `\n${movie.caption}`;
  return caption;
}

export function buildSerialPartCaption(serial, part) {
  return (
    `📺 <b>${serial.title}</b>\n` +
    `🎞 Qism: ${part.part}\n` +
    `💾 Hajmi: ${part.size || ''}\n` +
    `🌐 Til: ${serial.language || 'Uzbek tilida'}\n` +
    `🆔 Kodi: <code>s${serial.id}e${part.part}</code>`
  );
}

export function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function parseCodeSearch(text) {
  if (!text || typeof text !== 'string') {
    return { type: null, id: null, part: null };
  }
  const clean = text.toLowerCase().trim();

  // 1. Serial qism formati (aniq ajratuvchi bilan): s16e2, s16p2, s16_2, s16_e2, s16-2, serial16_part2
  const matchPart = clean.match(/^(?:s|serial)(\d+)(?:e|p|_e|_p|_|-|part)+(\d+)$/);
  if (matchPart) {
    return {
      type: 'serial_part',
      id: parseInt(matchPart[1], 10),
      part: parseInt(matchPart[2], 10),
    };
  }

  // 2. Serial formati: s16, s1, serial16
  const matchSerial = clean.match(/^(?:s|serial)(\d+)$/);
  if (matchSerial) {
    return {
      type: 'serial',
      id: parseInt(matchSerial[1], 10),
      part: null,
    };
  }

  // 3. Kino formati: m35, m1, movie35
  const matchMovie = clean.match(/^(?:m|movie)(\d+)$/);
  if (matchMovie) {
    return {
      type: 'movie',
      id: parseInt(matchMovie[1], 10),
      part: null,
    };
  }

  return { type: null, id: null, part: null };
}
