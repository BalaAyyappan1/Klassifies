// Function to generate a 6-digit OTP
export function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}