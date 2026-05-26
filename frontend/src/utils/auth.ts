interface AuthUser {
  role?: string;
}

interface JwtPayload {
  exp?: number;
}

export const getToken = () => localStorage.getItem('access_token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    logout();
    return null;
  }
};

const getTokenPayload = (token: string): JwtPayload | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = atob(normalizedPayload);
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string) => {
  const payload = getTokenPayload(token);
  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return false;
  }

  if (isTokenExpired(token)) {
    logout();
    return false;
  }

  return true;
};

export const getUserRole = () => {
  const user = getUser() as AuthUser | null;
  return user?.role?.toLowerCase() || null;
};

export const getHomePathForRole = (role?: string | null) => {
  return role?.toLowerCase() === 'admin' ? '/panel-control' : '/dashboard';
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.location.href = '/';
};
