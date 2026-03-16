import asyncio
import os
from config import BOT_TOKEN
from keyboards import main_menu, movies_inline_keyboard , serials_inline_keyboard , serial_parts_keyboard, other_bots_keyboard
from aiogram import Dispatcher , Bot ,F
from aiogram.filters import Command
from aiogram.types import Message , CallbackQuery, Update
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from services import get_movie_by_id , get_serial_by_id , get_serial_part , load_movies , load_serials
from fastapi import FastAPI, Request

from contextlib import asynccontextmanager

bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()
print(f"DEBUG: Dispatcher yaratildi ID: {id(dp)}")

# FastAPI uchun lifespan (startup/shutdown o'rniga)
@asynccontextmanager
async def lifespan(app: FastAPI):
    if BASE_URL:
        webhook_url = f"{BASE_URL}{WEBHOOK_PATH}"
        await bot.set_webhook(
            url=webhook_url,
            allowed_updates=["message", "callback_query", "inline_query"]
        )
        print(f"Webhook set to: {webhook_url}")
    yield
    await bot.session.close()

# FastAPI obyektini yaratish
app = FastAPI(lifespan=lifespan)

# Webhook manzillarini sozlash (agar serverda bo'lsa)
WEBHOOK_PATH = f"/bot/{BOT_TOKEN}"
BASE_URL = os.getenv("BASE_URL")  # Render/Vercel bergan URL manzili

@app.post(WEBHOOK_PATH)
async def bot_webhook(request: Request):
    try:
        update_data = await request.json()
        update = Update.model_validate(update_data, context={"bot": bot})
        await dp.feed_update(bot=bot, update=update)
    except Exception as e:
        print(f"Update error: {e}")
    return {"status": "ok"}

@app.get("/")
async def index():
    return {"status": "Bot is running..."}

# Avvalgi on_event o'chirildi, uning o'rniga yuqoridagi lifespan ishlaydi

@dp.message(Command("start"))
async def start_handler(message: Message):
    print(f"[LOG] /start keldi ID: {message.message_id} | User: {message.from_user.id} | PID: {os.getpid()}")
    user_id = message.from_user.id
    first_name = message.from_user.full_name
    
    welcome_text = (
        f"<b>Assalomu alaykum, <a href='tg://user?id={user_id}'>{first_name}</a>!</b> 👋\n"
        f"────────────────────\n"
        f"✨ <b>Islomiy Kinolar Olami</b>\n\n"
        f"Ushbu bot orqali siz eng sara <b>islomiy filmlar</b> va <b>tarixiy seriallarni</b> "
        f"yuqori sifatda hamda o'zbek tilida tomosha qilishingiz mumkin. 🎞\n\n"
        f"<i>Botdan foydalanish uchun quyidagi menyu tugmalaridan foydalaning yoki /movies buyrug;i orqali kino va seriallar ro'yxatini ko'rib , keraklisini yuborish orqali tomosha qilishingiz mumkin.</i>\n"
        f"────────────────────\n"
        f"👇 <b>Bo'limni tanlang:</b>"
    )

    await message.answer(welcome_text, reply_markup=main_menu)
    
    # Ikkinchi xabar: Bot haqida va foydali linklar
    about_text = (
        f"<b>Bot haqida qisqacha:</b>\n"
        f"────────────────────\n"
        f"Ushbu bot sizga islomiy ma'rifat ulashish maqsadida yaratilgan. "
        f"Barcha videolar ochiq manbalardan olingan.\n\n"
        f"🌟 <b>Bizning boshqa foydali loyihalarimiz:</b>"
    )
    
    await message.answer(about_text, reply_markup=other_bots_keyboard())

@dp.message(Command("help"))
async def help_handler(message: Message):
    help_text = (
        "<b>Yordam bo'limi</b> 🛠\n"
        "────────────────────\n"
        "Botdan samarali foydalanish uchun buyruqlar:\n\n"
        "💠 /start - <i>Botni ishga tushirish</i>\n"
        "📂 /movies - <i>Barcha kino va seriallar ro'yxati</i>\n"
        "❓ /help - <i>Yordam olish</i>\n\n"
        "<b>Qo'llanma:</b>\n"
        "1. Menyu orqali bo'limni tanlang.\n"
        "2. Ro'yxatdan o'zingizga yoqqan kinoni raqamini bosing.\n"
        "3. Video va uning tavsifi sizga yuboriladi.\n\n"
        "Bot bilan bog'liq xatolarni yoki takliflaringizni @asking_robot manziliga yuborishingiz mumkin.\n"
        "────────────────────\n"
        "😊 <i>Maroqli hordiq tilaymiz!</i>"
    )
    await message.answer(help_text)

@dp.message(Command("movies"))
async def movies_list_handler(message: Message):
    movies = load_movies()
    serials = load_serials()
    
    text = "📂 <b>Barcha mavjud kontentlar:</b>\n"
    text += "────────────────────\n\n"
    
    text += "🎬 <b>Kinolar ro'yxati:</b>\n"
    for i, m in enumerate(movies, 1):
        text += f"{i}. <code>{m['title']}</code>\n"
        
    text += "\n📺 <b>Seriallar ro'yxati:</b>\n"
    for i, s in enumerate(serials, 1):
        parts_count = len(s.get('parts', []))
        text += f"{i}. <code>{s['title']}</code> (<i>{parts_count} qism</i>)\n"
        
    text += "\n────────────────────\n"
    text += "💡 <i>Nom ustiga bossangiz nusxa olinadi. Va uni botga yuborsangiz shu filmni olishingiz mumkin.</i>"
    await message.answer(text)

def format_page_text(items, page, total_title, items_per_page=10):
    start_idx = page * items_per_page
    end_idx = start_idx + items_per_page
    page_items = items[start_idx:end_idx]
    
    text = f"<b>{total_title}</b> (Sahifa {page + 1}):\n"
    text += "────────────────────\n\n"
    for i, item in enumerate(page_items):
        text += f"{i + 1}. <code>{item['title']}</code>\n"
    
    text += "\n👇 <b>Kino raqamini tanlang:</b>"
    return text

@dp.message(F.text == "🎬 Kinolar")
async def kinolar(message:Message):
    movies = load_movies()
    text = format_page_text(movies, 0, "🎬 Kinolar ro'yxati")
    await message.answer(text, reply_markup=movies_inline_keyboard(0))

@dp.message(F.text == "📺 Seriallar")
async def seriallar(message:Message):
    serials = load_serials()
    text = format_page_text(serials, 0, "📺 Seriallar ro'yxati")
    await message.answer(text, reply_markup=serials_inline_keyboard(0))

@dp.callback_query(F.data.startswith("movie_page_"))
async def movie_page_callback(callback: CallbackQuery):
    page = int(callback.data.split("_")[2])
    movies = load_movies()
    text = format_page_text(movies, page, "🎬 Kinolar ro'yxati")
    await callback.message.edit_text(text, reply_markup=movies_inline_keyboard(page))
    await callback.answer()

@dp.callback_query(F.data.startswith("serial_page_"))
async def serial_page_callback(callback: CallbackQuery):
    page = int(callback.data.split("_")[2])
    serials = load_serials()
    text = format_page_text(serials, page, "📺 Seriallar ro'yxati")
    await callback.message.edit_text(text, reply_markup=serials_inline_keyboard(page))
    await callback.answer()

def format_parts_text(serial, page, items_per_page=10):
    start_idx = page * items_per_page
    end_idx = start_idx + items_per_page
    page_items = serial["parts"][start_idx:end_idx]
    
    text = f"📺 <b>{serial['title']}</b> (Qismlar sahifasi {page + 1}):\n\n"
    for part in page_items:
        text += f"🎞 {part['part']}-qism\n"
    
    text += "\nQism raqamini tanlang:"
    return text

@dp.callback_query(F.data.startswith("serial_parts_page_"))
async def serial_parts_page_callback(callback: CallbackQuery):
    # Callback format: serial_parts_page_{serial_id}_{part_page}_{serial_page}
    data = callback.data.split("_")
    serial_id = int(data[3])
    part_page = int(data[4])
    serial_page = int(data[5])
    
    serial = get_serial_by_id(serial_id)
    if serial:
        text = format_parts_text(serial, part_page)
        await callback.message.edit_text(text, reply_markup=serial_parts_keyboard(serial_id, part_page, serial_page))
    await callback.answer()

@dp.callback_query(F.data.startswith("serial_back_"))
async def serial_back_callback(callback: CallbackQuery):
    page = int(callback.data.split("_")[2])
    serials = load_serials()
    text = format_page_text(serials, page, "📺 Seriallar ro'yxati")
    await callback.message.edit_text(text, reply_markup=serials_inline_keyboard(page))
    await callback.answer()

@dp.callback_query(F.data.startswith("serial_"))
async def serial_callback(callback: CallbackQuery):
    data = callback.data.split("_")
    serial_id = int(data[1])
    serial_page = int(data[2]) if len(data) > 2 else 0
    
    serial = get_serial_by_id(serial_id)
    if serial:
        text = format_parts_text(serial, 0)
        await callback.message.edit_text(
            text,
            reply_markup=serial_parts_keyboard(serial_id, 0, serial_page)
        )
    await callback.answer()

@dp.callback_query(F.data.startswith("movie_"))
async def movie_callback(callback: CallbackQuery):
    data = callback.data.split("_")
    movie_id = int(data[1])
    movie = get_movie_by_id(movie_id)
    
    if movie:
        # Captionni chiroyli ko'rinishga keltirish (null qiymatlarni tekshirish)
        caption = f"🎬 <b>{movie['title']}</b>\n"
        
        if movie.get('year'):
            caption += f"📅 Yili: {movie['year']}\n"
        
        if movie.get('duration'):
            caption += f"⏳ Davomiyligi: {movie['duration']}\n"
        
        if movie.get('language'):
            caption += f"🌐 Til: {movie['language']}\n"
            
        caption += f"\n{movie['caption']}"

        await callback.message.answer_video(
            video=movie["file_id"],
            caption=caption
        )
    
    await callback.answer()

@dp.callback_query(F.data.startswith("part_"))
async def send_serial_part(callback: CallbackQuery):
    data = callback.data.split("_")
    serial_id = int(data[1])
    part_number = int(data[2])
    # page = int(data[3]) if len(data) > 3 else 0 # Agar qismdan keyin ham orqaga kerak bo'lsa

    serial = get_serial_by_id(serial_id)
    part = get_serial_part(serial_id, part_number)

    if serial and part:
        caption = (
            f"📺 <b>{serial['title']}</b>\n"
            f"🎞 Qism: {part['part']}\n"
            f"💾 Hajmi: {part['size']}\n"
            f"🌐 Til: {serial['language']}"
        )

        await callback.message.answer_video(
            video=part["file_id"],
            caption=caption
        )

    await callback.answer()

@dp.message()
async def search_by_title_handler(message: Message):
    # Buyruqlarni (masalan /start) bu handlerda o'tkazib yubormaslik uchun
    if message.text and message.text.startswith("/"):
        return
    text = message.text.strip()
    
    # 1. Kinolardan qidirish
    movies = load_movies()
    movie = next((m for m in movies if m['title'].lower() == text.lower()), None)
    
    if movie:
        caption = f"🎬 <b>{movie['title']}</b>\n"
        if movie.get('year'): caption += f"📅 Yili: {movie['year']}\n"
        if movie.get('duration'): caption += f"⏳ Davomiyligi: {movie['duration']}\n"
        if movie.get('language'): caption += f"🌐 Til: {movie['language']}\n"
        caption += f"\n{movie['caption']}"
        
        await message.answer_video(video=movie["file_id"], caption=caption)
        return

    # 2. Seriallardan qidirish
    serials = load_serials()
    serial = next((s for s in serials if s['title'].lower() == text.lower()), None)
    
    if serial:
        text_parts = format_parts_text(serial, 0)
        await message.answer(
            text_parts,
            reply_markup=serial_parts_keyboard(serial['id'], 0, 0)
        )
        return

    # Agar hech narsa topilmasa
    await message.answer(
        "❌ <b>Kechirasiz, bunday nomdagi kino yoki serial topilmadi.</b>\n\n"
        "Iltimos, nomni to'g'ri yozganingizni tekshiring yoki ro'yxatdan nusxa olib yuboring.",
        reply_markup=main_menu
    )

async def run_polling():
    # Webhookni o'chirish (Polling ishlashi uchun shart)
    await bot.delete_webhook(drop_pending_updates=True)
    print("Eski yangilanishlar tozalandi va Polling ishga tushdi.")
    await dp.start_polling(bot)

if __name__ == "__main__":
    import uvicorn
    if not BASE_URL:
        print("Bot is starting in Polling mode...")
        asyncio.run(run_polling())
    else:
        print(f"Bot is starting in Webhook mode on {BASE_URL}...")
        uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))