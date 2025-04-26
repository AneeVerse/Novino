// lib/otp-store.ts
const otpStore = new Map<string, { otp: string; expires: number }>();

export function setOtp(email: string, otp: string, expires: number) {
  otpStore.set(email, { otp, expires });
}

export function getOtp(email: string) {
  return otpStore.get(email);
}

export function deleteOtp(email: string) {
  otpStore.delete(email);
} 