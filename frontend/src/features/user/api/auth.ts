import axios from "axios";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_USER_API_URL}/auth/login`,
      { email, password },
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error(error.message || "An unexpected error occurred");
  }
};

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  code?: string;
}) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_USER_API_URL}/users`,
      userData,
    );

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Registration failed");
    }
    throw new Error(error.message || "An unexpected error occurred");
  }
};
