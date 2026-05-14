const DB_KEY = "quizapp_db";

const getDB = () => {
  return JSON.parse(localStorage.getItem(DB_KEY)) || {
    admin: {},
    users: [],
    quizzes: [],
    attempts: [],
  };
};

const saveDB = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const cacheOps = {

  async getAdminSession() {
    const db = getDB();
    return db.admin || { id: 1, isLoggedIn: false };
  },

  async setAdminSession(isLoggedIn) {
    const db = getDB();
    db.admin = { id: 1, isLoggedIn };
    saveDB(db);
  },

  
  async getAllQuizzes() {
    const db = getDB();
    return db.quizzes.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  async getQuiz(id) {
    const db = getDB();
    return db.quizzes.find((q) => q.id === id);
  },

  async saveQuiz(quiz) {
    const db = getDB();
    const index = db.quizzes.findIndex((q) => q.id === quiz.id);

    if (index >= 0) db.quizzes[index] = quiz;
    else db.quizzes.push(quiz);

    saveDB(db);
  },

  async deleteQuiz(id) {
    const db = getDB();
    db.quizzes = db.quizzes.filter((q) => q.id !== id);
    saveDB(db);
  },

  
  async getUser(id) {
    const db = getDB();
    return db.users.find((u) => u.id === id);
  },

  async getUserByUsername(username) {
    const db = getDB();
    return db.users.find((u) => u.username === username);
  },

  async saveUser(user) {
    const db = getDB();
    const index = db.users.findIndex((u) => u.id === user.id);

    if (index >= 0) db.users[index] = user;
    else db.users.push(user);

    saveDB(db);
  },


  async saveAttempt(attempt) {
    const db = getDB();
    db.attempts.push(attempt);
    saveDB(db);
  },

  async getAttemptsByQuiz(quizId) {
    const db = getDB();
    return db.attempts.filter((a) => a.quizId === quizId);
  },

  async getAttemptsByUser(userId) {
    const db = getDB();
    return db.attempts.filter((a) => a.userId === userId);
  },

  async getAttemptsByQuizAndUser(quizId, userId) {
    const db = getDB();
    return db.attempts.filter(
      (a) => a.quizId === quizId && a.userId === userId
    );
  },
};