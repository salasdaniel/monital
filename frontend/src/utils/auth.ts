export const getToken = () => localStorage.getItem('access_token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.location.href = '/';
};
