import { table, integer, text, boolean, json, sql } from 'sdk/db';

// Foydalanuvchilarni saqlash va statistika uchun jadval
export const users = table('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  username: text('username'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  lastActive: integer('last_active', { mode: 'timestamp' }),
});

// Admin holatini va sessiyasini saqlash jadvali
export const adminStates = table('admin_states', {
  tgId: integer('tg_id').primaryKey(),
  isAuthenticated: boolean('is_authenticated').default(false),
  state: text('state').default('idle'),
  tempData: json('temp_data'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// Admin tomonidan yangi qo'shilgan kinolar jadvali
export const customMovies = table('custom_movies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  caption: text('caption'),
  fileId: text('file_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Admin tomonidan o'chirilgan kinolar (masalan m4) jadvali
export const deletedMovies = table('deleted_movies', {
  movieId: integer('movie_id').primaryKey(),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
