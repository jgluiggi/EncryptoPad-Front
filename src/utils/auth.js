import { jwtDecode } from 'jwt-decode';

export function getUserIdFromToken() {
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error('No token found in localStorage');
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    return decoded.userId;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
