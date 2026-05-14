import { cacheOps } from "./db";

const USER_KEY = "quizapp_user";

export const authService = {
  
  async loginAdmin(password) {
    const ADMIN_PASS = "anil123";

    if (password === ADMIN_PASS) {
      await cacheOps.setAdminSession(true);
      return true;
    }
    return false;
  },

  async logoutAdmin() {
    await cacheOps.setAdminSession(false);
  },

  
  async loginUser(username, password) {
    const user = await cacheOps.getUserByUsername(username);
    if (!user) return null;

    if (user.passwordHash !== password) return false;

    localStorage.setItem(USER_KEY, user.id);
    return user;
  },

  
  async registerUser(username, password) {
    const existing = await cacheOps.getUserByUsername(username);
    if (existing) return null;

    const newUser = {
      id: Date.now().toString(),
      username,
      passwordHash: password,
      displayName: displayName || username,
      createdAt: new Date().toISOString(),
    };

    await cacheOps.saveUser(newUser);
    localStorage.setItem(USER_KEY, newUser.id);

    return newUser;
  },

  
  async logoutUser() {
    localStorage.removeItem(USER_KEY);
  },

  
  async updateUserDisplayName(user, name) {
    const updated = { ...user, displayName: name };
    await cacheOps.saveUser(updated);
    return updated;
  },
};