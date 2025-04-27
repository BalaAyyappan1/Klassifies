import axios from "axios";

export const loginWithGoogle = () => {
  const authUrl = `/api/google-auth`;
  window.location.href = authUrl;
};


export const handleLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      "/api/auth/signin",
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || "Failed to sign in.");
    } else {
      throw new Error("Failed to sign in.");
    }
  }
};


export const checkAuthStatus = async () => {
  const response = await fetch("/api/auth-status");
  const data = await response.json();
  return data.isAuthenticated;
};

export const fetchUserInfo = async () => {
  const response = await fetch("/api/user");
  const userInfo = await response.json();
  return {
    name: userInfo.user.name,
    profile: userInfo.user.profile,
  };
};



export const forgotPassword = async (email: string) => {
  const response = await axios.post("/api/auth/forgot-password", { email });
  return response.data;
};

//Reset Password
export const resetPassword = async (newPassword: string, token: string) => {
  const response = await axios.post("/api/auth/reset-password", { newPassword, token });
  return response.data;
};
