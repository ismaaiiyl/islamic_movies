# 🎞 Islomiy Kinolar Bot — Telegram Cloud Serverless

Ushbu bot rasmiy **Telegram Cloud Serverless** platformasida ishlaydi. Hech qanday tashqi server (VPS, Vercel, Render) talab qilinmaydi — bot to'g'ridan-to'g'ri Telegram infratuzilmasidagi V8 isolate muhitida ishlaydi.

---

## 📂 Loyiha tuzilishi (Clean & DRY — barcha fayllar 200 qatordan kam!)

```text
islomiy_kinolar_bot/
├── tgcloud/
│   ├── handlers/
│   │   ├── message.js             # Xabarlar dispetcheri (139 qator)
│   │   └── callback_query.js     # Inline tugmalar dispetcheri (164 qator)
│   ├── lib/
│   │   ├── admin/                 # 👑 Admin paneli modullari
│   │   │   ├── adminAuth.js       # Parol ("ismoil") va sessiyalar (65 qator)
│   │   │   ├── adminBroadcaster.js# Barcha turdagi xabarlarni tarqatish (61 qator)
│   │   │   ├── adminContent.js    # Kino qo'shish va o'chirish (78 qator)
│   │   │   ├── adminHandler.js    # Admin xabarlarini boshqarish (146 qator)
│   │   │   ├── adminCallbacks.js  # Admin tugmalarini boshqarish (122 qator)
│   │   │   └── adminKeyboards.js  # Admin menyulari va tugmalari (25 qator)
│   │   ├── search.js              # Aqlli qidiruv (kod, raqam, qisman nom) (97 qator)
│   │   ├── media.js               # Video yuborish va upload_video holati (60 qator)
│   │   ├── commands.js            # /start, /help, /stat, /movies (140 qator)
│   │   ├── userTracker.js         # Foydalanuvchilarni SQLite bazaga yozish (31 qator)
│   │   ├── services.js            # Dinamik ma'lumotlar xizmati (67 qator)
│   │   ├── helpers.js             # Matn formatlash va regex (107 qator)
│   │   ├── keyboards.js           # Menyu va tezkor sakrash tugmalari (116 qator)
│   │   └── data.js                # Baza ma'lumotlari (35 ta kino, 19 ta serial)
│   └── schema.js                  # SQLite ma'lumotlar bazasi sxemasi (37 qator)
├── docs/                          # Telegram Cloud SDK rasmiy qo'llanmasi
├── tgcloud.jsonc                  # Loyiha konfiguratsiyasi
└── package.json                   # Skriptlar va @tgcloud/cli
```

---

## 👑 Admin Panel Qo'llanmasi

1. **Kirish:** Botga `/admin` buyrug'ini yuboring.
2. **Parol:** `ismoil` deb yozing.
3. **Asosiy bo'limlar:**
   * **📊 Statistika (`admin_stat`):** Baza foydalanuvchilari soni, jami kinolar va seriallar, server tezligi va holati.
   * **📢 Xabar tarqatish (`admin_broadcast`):** Istalgan formatdagi (matn, rasm, video, audio, ovozli xabar, fayl) xabarni yuboring — u barcha foydalanuvchilarga `copyMessage` orqali to'liq yetkaziladi.
   * **🎬 Kontent boshqaruvi (`admin_content`):**
     * **➕ Kino qo'shish:** Kino nomi so'raladi (masalan: `Yusuf alayhissalom`), so'ngra videoni yuborasiz (videodagi caption avtomatik saqlanadi). Kinoga avtomatik keyingi kod (masalan `m36`) beriladi va u bazaga qo'shiladi.
     * **🗑 Kino o'chirish:** O'chirmoqchi bo'lgan kino kodi (masalan: `m4` yoki `4`) kiritiladi va u darhol ro'yxatdan olib tashlanadi.
   * **🚪 Chiqish (`admin_logout`):** Admin sessiyasini yopish.
