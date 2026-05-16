import { cacheOps } from "./db";

export const quizService = {
  getAllQuizzes: () => cacheOps.getAllQuizzes(),
  getQuiz: (id) => cacheOps.getQuiz(id),
  saveQuiz: (quiz) => cacheOps.saveQuiz(quiz),
  deleteQuiz: (id) => cacheOps.deleteQuiz(id),

  
};