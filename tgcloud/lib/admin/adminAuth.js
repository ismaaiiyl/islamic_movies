import { eq } from 'sdk/db';
import { adminStates } from '../../schema.js';

const ADMIN_PASSWORD = 'ismoil';

export async function getAdminState(db, tgId) {
  if (!tgId) return { tgId, isAuthenticated: false, state: 'idle', tempData: null };
  try {
    const row = await db.select().from(adminStates).where(eq(adminStates.tgId, tgId)).get();
    if (!row) {
      return { tgId, isAuthenticated: false, state: 'idle', tempData: null };
    }
    return {
      tgId,
      isAuthenticated: Boolean(row.isAuthenticated),
      state: row.state || 'idle',
      tempData: row.tempData || null,
    };
  } catch (err) {
    console.error('getAdminState error:', err);
    return { tgId, isAuthenticated: false, state: 'idle', tempData: null };
  }
}

export async function setAdminState(db, tgId, updates = {}) {
  if (!tgId) return;
  try {
    const now = new Date();
    const existing = await db
      .select()
      .from(adminStates)
      .where(eq(adminStates.tgId, tgId))
      .get()
      .catch(() => null);

    const isAuth =
      updates.isAuthenticated !== undefined
        ? updates.isAuthenticated
        : existing
        ? Boolean(existing.isAuthenticated)
        : false;

    await db
      .insert(adminStates)
      .values({
        tgId,
        isAuthenticated: isAuth,
        state: updates.state ?? (existing?.state || 'idle'),
        tempData: updates.tempData !== undefined ? updates.tempData : (existing?.tempData || null),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: adminStates.tgId,
        set: {
          ...(updates.isAuthenticated !== undefined ? { isAuthenticated: updates.isAuthenticated } : {}),
          ...(updates.state !== undefined ? { state: updates.state } : {}),
          ...(updates.tempData !== undefined ? { tempData: updates.tempData } : {}),
          updatedAt: now,
        },
      })
      .run();
  } catch (err) {
    console.error('setAdminState error:', err);
  }
}

export function isCorrectPassword(input) {
  if (!input || typeof input !== 'string') return false;
  return input.trim() === ADMIN_PASSWORD;
}

export async function logoutAdmin(db, tgId) {
  await setAdminState(db, tgId, {
    isAuthenticated: false,
    state: 'idle',
    tempData: null,
  });
}
