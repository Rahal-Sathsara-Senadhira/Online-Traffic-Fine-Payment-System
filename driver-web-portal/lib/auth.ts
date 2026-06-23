import { jwtDecode } from 'jwt-decode';

export const TOKEN_KEY = 'accessToken';
export const REFRESH_KEY = 'refreshToken';

export const setToken = (token: string, refreshToken?: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getUserFromToken = (token: string) => {
  try {
    return jwtDecode<any>(token);
  } catch {
    return null;
  }
};
