from aiogram.types import ReplyKeyboardMarkup , KeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder
from services import load_movies , load_serials , get_serial_by_id

main_menu = ReplyKeyboardMarkup(
    keyboard=
    [
        [
            KeyboardButton(text="🎬 Kinolar", style = "primary" ),
            KeyboardButton(text="📺 Seriallar" , style = "primary")
        ]

    ],
    resize_keyboard=True
)

def get_pagination_keyboard(items, page, prefix, items_per_page=10, back_callback=None, is_parts=False, serial_id=None, serial_page=0):
    builder = InlineKeyboardBuilder()
    
    start_idx = page * items_per_page
    end_idx = start_idx + items_per_page
    page_items = items[start_idx:end_idx]
    
    # Raqamlangan tugmalar
    for i, item in enumerate(page_items):
        if is_parts:
            # Serial qismlari uchun: "1-qism", "2-qism" va h.k.
            text = f"{item['part']}"
            callback_data = f"part_{serial_id}_{item['part']}_{page}_{serial_page}"
        else:
            # Kinolar/Seriallar ro'yxati uchun: 1, 2, 3...
            text = str(i + 1)
            callback_data = f"{prefix}_{item['id']}_{page}"
            
        builder.button(text=text, callback_data=callback_data)
    
    # Tugmalarni 5 tadan joylash
    adjust_pattern = [5] * (len(page_items) // 5)
    if len(page_items) % 5 > 0:
        adjust_pattern.append(len(page_items) % 5)
    
    # Navigatsiya qatori
    nav_buttons_count = 0
    
    # Sahifa almashtirish tugmalari
    if page > 0:
        cb = f"{prefix}_parts_page_{serial_id}_{page - 1}_{serial_page}" if is_parts else f"{prefix}_page_{page - 1}"
        builder.button(text="⬅️", callback_data=cb)
        nav_buttons_count += 1
    
    builder.button(text=f"{page + 1}-sahifa", callback_data="ignore")
    nav_buttons_count += 1
    
    if end_idx < len(items):
        cb = f"{prefix}_parts_page_{serial_id}_{page + 1}_{serial_page}" if is_parts else f"{prefix}_page_{page + 1}"
        builder.button(text="➡️", callback_data=cb)
        nav_buttons_count += 1
    
    adjust_pattern.append(nav_buttons_count)
    
    # "Orqaga" tugmasi (agar berilgan bo'lsa)
    if back_callback:
        builder.button(text="⬅️ Orqaga", callback_data=back_callback)
        adjust_pattern.append(1)
    
    builder.adjust(*adjust_pattern)
    return builder.as_markup()


def movies_inline_keyboard(page=0):
    movies = load_movies()
    return get_pagination_keyboard(movies, page, "movie")

def serials_inline_keyboard(page=0):
    serials = load_serials()
    return get_pagination_keyboard(serials, page, "serial")


 # Serial ichidagi qismlar (2-bosqich)
def serial_parts_keyboard(serial_id: int, part_page: int = 0, serial_page: int = 0):
    serial = get_serial_by_id(serial_id)
    if not serial:
        return None
    
    return get_pagination_keyboard(
        items=serial["parts"],
        page=part_page,
        prefix="serial",
        is_parts=True,
        serial_id=serial_id,
        serial_page=serial_page,
        back_callback=f"serial_back_{serial_page}"
    )


