import { users } from '../schema.js';

export async function trackUser(db, from) {
  if (!from || !from.id) return;
  try {
    const now = new Date();
    await db
      .insert(users)
      .values({
        tgId: from.id,
        firstName: from.first_name || '',
        lastName: from.last_name || '',
        username: from.username || '',
        createdAt: now,
        lastActive: now,
      })
      .onConflictDoUpdate({
        target: users.tgId,
        set: {
          firstName: from.first_name || '',
          lastName: from.last_name || '',
          username: from.username || '',
          lastActive: now,
        },
      })
      .run();
  } catch (err) {
    console.error('trackUser error:', err);
  }
}
