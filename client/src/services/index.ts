
export const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('Token not found');
    return false;
  }
  return token;
}
