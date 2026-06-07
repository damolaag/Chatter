export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string) {
  return password.length >= 6;
}

export function isValidPostTitle(title: string) {
  return title.trim().length > 0;
}