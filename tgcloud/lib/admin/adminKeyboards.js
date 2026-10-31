export const adminMainMenu = {
  inline_keyboard: [
    [{ text: '📊 Statistika', callback_data: 'admin_stat' }],
    [{ text: '📢 Xabar tarqatish', callback_data: 'admin_broadcast' }],
    [{ text: '🎬 Kontent boshqaruvi', callback_data: 'admin_content' }],
    [{ text: '🚪 Chiqish', callback_data: 'admin_logout' }],
  ],
};

export const adminContentMenu = {
  inline_keyboard: [
    [{ text: "➕ Kino qo'shish", callback_data: 'admin_add_movie' }],
    [{ text: "🗑 Kino o'chirish", callback_data: 'admin_del_movie' }],
    [{ text: '⬅️ Admin menyuga qaytish', callback_data: 'admin_menu' }],
  ],
};

export function adminCancelKeyboard(backCallback = 'admin_menu') {
  return {
    inline_keyboard: [
      [{ text: '🔙 Ortga / Bekor qilish', callback_data: backCallback }],
    ],
  };
}

export const adminBroadcastConfirmKeyboard = {
  inline_keyboard: [
    [{ text: '✅ Ha, barchaga yuborilsin', callback_data: 'admin_broadcast_send' }],
    [{ text: '❌ Bekor qilish', callback_data: 'admin_broadcast_cancel' }],
  ],
};

export function adminPostActionKeyboard(actionType = 'content') {
  if (actionType === 'add_movie') {
    return {
      inline_keyboard: [
        [{ text: "➕ Yana kino qo'shish", callback_data: 'admin_add_movie' }],
        [{ text: '🎬 Kontent menyusi', callback_data: 'admin_content' }],
        [{ text: '👑 Asosiy menyu', callback_data: 'admin_menu' }],
      ],
    };
  }
  if (actionType === 'del_movie') {
    return {
      inline_keyboard: [
        [{ text: "🗑 Yana kino o'chirish", callback_data: 'admin_del_movie' }],
        [{ text: '🎬 Kontent menyusi', callback_data: 'admin_content' }],
        [{ text: '👑 Asosiy menyu', callback_data: 'admin_menu' }],
      ],
    };
  }
  if (actionType === 'broadcast') {
    return {
      inline_keyboard: [
        [{ text: '📢 Yana xabar tarqatish', callback_data: 'admin_broadcast' }],
        [{ text: '👑 Asosiy menyu', callback_data: 'admin_menu' }],
      ],
    };
  }
  return {
    inline_keyboard: [
      [{ text: '🎬 Kontent menyusi', callback_data: 'admin_content' }],
      [{ text: '👑 Asosiy menyu', callback_data: 'admin_menu' }],
    ],
  };
}
