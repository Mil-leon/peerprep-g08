import axios from "axios";
import type { Question } from "../../questions/types/question.types";

const QUESTION_API_URL = `${import.meta.env.VITE_API_GATEWAY_URL ?? "http://localhost:8080"}/api/questions`;

export const getQuestionById = async (id: string): Promise<Question> => {
  const response = await axios.get<Question>(`${QUESTION_API_URL}/${id}`);
  return response.data;
};
