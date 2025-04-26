// lib/user-store.ts
interface UserRecord {
  username: string;
  passwordHash: string;
}

const userStore = new Map<string, UserRecord>();

export function setUser(email: string, user: UserRecord) {
  userStore.set(email, user);
}

export function getUser(email: string): UserRecord | undefined {
  return userStore.get(email);
}

export function deleteUser(email: string) {
  userStore.delete(email);
} 