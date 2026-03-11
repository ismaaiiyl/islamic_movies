import json
from pathlib import Path

BASE_DIR = Path(__file__).parent

def load_movies():
    file_path = BASE_DIR / "movies" / "movies.json"
    with open(file_path , "r" , encoding="utf-8") as file:
        return json.load(file)
    
def load_serials():
    file_path = BASE_DIR / "movies" / "serials" / "movies.json"
    with open(file_path , "r" , encoding="utf-8") as file:
        return json.load(file)
    
def get_movie_by_id(movie_id : int):
    movies = load_movies()
    return next((movie for movie in movies if movie["id"] == movie_id) , None)

def get_serial_by_id(serial_id : int):
    serials = load_serials()
    return next((s for s in serials if s["id"] == serial_id) , None)

def get_serial_part(serial_id: int, part_number: int):
    serial = get_serial_by_id(serial_id)
    if serial:
        return next(
            (p for p in serial["parts"] if p["part"] == part_number),
            None
        )
    return None

