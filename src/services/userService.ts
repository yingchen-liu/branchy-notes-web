import axios from "axios"
import { createHeader } from "./services";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;

export const login = async (): Promise<CurrentUser> => {
  const res = await axios.post(`${API_BASE_URL}/login`, undefined, createHeader())
  return res.data as CurrentUser
}

export const getUserById = async (userId: string): Promise<User> => {
  const res = await axios.get(`${API_BASE_URL}/${encodeURIComponent(userId)}`, createHeader())
  return res.data as User
}

export const updateUser = async (userId: string, user: Partial<User>, language: string): Promise<User> => {
  const res = await axios.patch(`${API_BASE_URL}/${encodeURIComponent(userId)}?language=${language}`, user, createHeader())
  return res.data as User
}