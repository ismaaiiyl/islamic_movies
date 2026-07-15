# 🎞 Islomiy Kino Bot

✨ **Islomiy Kinolar Olami** — Bu Telegram bot orqali siz eng sara islomiy filmlar, tarixiy seriallar va ibratli hikoyalarni yuqori sifatda, o'zbek tilida tomosha qilishingiz mumkin.

![Islomiy Kino Bot Banner](banner.png)

---

## 🚀 Xususiyatlari

*   **🎬 Filmlar Kolleksiyasi:** Keng qamrovli islomiy va tarixiy filmlar ro'yxati.
*   **📺 Seriallar Bo'limi:** Har bir serialning barcha qismlari tartiblangan holda.
*   **🔍 Aqlli Qidiruv:** Film nomi orqali darhol kerakli videoni topish.
*   **🔄 Sahifalash (Pagination):** Kontentlar orasida oson navigatsiya.
*   **🌐 Webhook/Polling Support:** Render va Vercel platformalarida oson deploy qilish uchun moslangan.

---

## 🛠 Texnologiyalar

*   **Python 3.x**
*   **Aiogram 3.x** (Telegram Bot framework)
*   **FastAPI** (Web server for Webhooks)
*   **Vercel/Render** compatibility

---

## 📂 Loyiha Strukturasi

```text
islomiy-kino-bot/
├── app.py              # Asosiy bot fayli (FastAPI + aiogram)
├── config.py           # Sozlamalar (BOT_TOKEN yuklash)
├── keyboards.py        # Tugmalar va navigatsiya
├── services.py         # Ma'lumotlarni o'qish va filtrlash
├── movies/             # Filmlar va seriallar ma'lumotlari (JSON)
├── requirements.txt    # Kerakli paketlar
└── vercel.json         # Vercel uchun sozlamalar
```

---

## 📦 O'rnatish va Ishga tushirish

1.  **Repozitoriyadan nusxa oling:**
    ```bash
    git clone https://github.com/sizning-username/islomiy-kino-bot.git
    cd islomiy-kino-bot
    ```

2.  **Virtual muhit yaratish va faollashtirish:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # Linux/macOS
    # yoki
    venv\Scripts\activate  # Windows
    ```

3.  **Kutubxonalarni o'rnatish:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **.env faylini yarating va tokenni qo'shing:**
    ```text
    BOT_TOKEN=Sizning_Tokeningiz_Bu_Yerdan
    ```

5.  **Botni ishga tushiring:**
    ```bash
    python app.py
    ```

---

## ☁️ Deploy (Render / Vercel)

Ushbu bot **Webhook** orqali ishlashga tayyorlangan. Deploy qilganingizda, quyidagi **Environment Variables**ni qo'shishingiz kerak:

*   `BOT_TOKEN`: Telegram bot tokeni.
*   `BASE_URL`: Serveringizning manzili (masalan: `https://mybot.vercel.app`).

---

## 🤝 Aloqa

Agar biron bir taklif yoki savolingiz bo'lsa, Telegram orqali bog'lanishingiz mumkin.

Maroqli hordiq tilaymiz! 😊


## 🎬 Available Movies

The Telegram bot currently includes the following Islamic movies and series in Uzbek language:

| Movie | Movie |
|-------|-------|
| Fath 1453 (2012) | Avliyo |
| Muqaddas Zamin | Suiqasd (Hayot bin Qays al-Harroniy) |
| Hasan Basriy | Bishriy Hofiy |
| Botmagan Quyosh | Oydin Kecha |
| Ibrohim Ibn Adham | Imom Al-Buxoriy |
| Abu Bakr As-Siddiq (R.A.) | Payg'ambarlar kinosi |
| Aziz Mahmud Hudoyi | Robiya |
| Daniyalik Kelin | Uvays al-Qaroniy |
| Hasad | Ibrat (2021) |
| Muhammad Fotih | Ali Samarqandiy |
| G'ayrat (Abul Vafo) | Samo farzandlari |
| Payg'ambar oshig'i Hasan | Ka'b ibn Zuhayr |
| Baxt kimyogari (Imom G'azzoliy) | Abu Turob Naqshbandiy |
| Adolat Qilichi | G'aroyib kolleksioner |
| Tutash Qalblar | Islom iymon saltanati |
| Kapernaum (2018) | Muso alayhissalom va Fir'avn |
| Mangulikning ikki qirg'og'i | Jannat onalar oyog'i ostida (2024) |
| 172 kun (2023) | |


## Telegram Bot
https://t.me/islomiy_kinolar_bot

## Keywords
Islamic Movies Telegram Bot
Islomiy Kinolar
Islamiy Kinolar Bot
Muslim Movies
o'zbekcha kinolar
ozbekcha islomiy kinolar
Uzbek Telegram Bot
Islomiy filmlar
Islomiy seriallar
Islomiy kinolar
Islomiy kino
O'zbekcha Islomiy kinolar
