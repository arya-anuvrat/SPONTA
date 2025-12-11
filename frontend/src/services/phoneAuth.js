/**
 * Phone Authentication Service using Firebase
 * Note: For Expo, phone auth requires additional setup with Recaptcha
 * This is a simplified implementation that works with Firebase's phone auth
 */
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential
} from "firebase/auth";
import { auth } from "./firebase";

// Store recaptcha verifier instance
let recaptchaVerifier = null;

/**
 * Initialize Recaptcha verifier for phone authentication
 * For Expo/React Native, we need to handle this differently
 * Note: RecaptchaVerifier may not work in Expo Go - this is a known limitation
 */
export const initializeRecaptcha = () => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }

    // For React Native, RecaptchaVerifier works differently
    // We don't need a container ID in React Native - use null or empty string
    if (!recaptchaVerifier) {
      // In React Native, the container can be null or an empty string
      // The invisible size works for mobile
      recaptchaVerifier = new RecaptchaVerifier(auth, {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha verified");
        },
        "expired-callback": () => {
          console.log("Recaptcha expired - will retry");
          recaptchaVerifier = null;
        },
      });
    }
    return recaptchaVerifier;
  } catch (error) {
    console.error("Error initializing Recaptcha:", error);
    // If RecaptchaVerifier fails (common in Expo Go), provide helpful error
    if (error.message?.includes("prototype") || 
        error.message?.includes("container") ||
        error.message?.includes("not a constructor")) {
      throw new Error(
        "Phone verification requires a development build. " +
        "RecaptchaVerifier is not available in Expo Go. " +
        "Please use email sign-up instead, or build a development build."
      );
    }
    throw error;
  }
};

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +1234567890)
 * @returns {Promise<ConfirmationResult>} - Confirmation result with verification ID
 */
export const sendOTP = async (phoneNumber) => {
  try {
    // Format phone number to E.164 format if needed
    const formattedPhone = phoneNumber.startsWith("+") 
      ? phoneNumber 
      : `+1${phoneNumber.replace(/\D/g, "")}`;

    // Initialize Recaptcha verifier
    const verifier = initializeRecaptcha();

    // Send verification code
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      verifier
    );

    // Return confirmation result (contains verification ID and confirm method)
    return confirmationResult;
  } catch (error) {
    console.error("Error sending OTP:", error);
    // Reset verifier on error
    recaptchaVerifier = null;
    throw error;
  }
};

/**
 * Verify OTP code using confirmation result
 * @param {ConfirmationResult} confirmationResult - Confirmation result from sendOTP
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<UserCredential>}
 */
export const verifyOTP = async (confirmationResult, code) => {
  try {
    // Use the confirm method from confirmation result
    const userCredential = await confirmationResult.confirm(code);
    return userCredential;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

/**
 * Format phone number for display
 * @param {string} phone - Raw phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validatePhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  
  if (!cleaned) {
    return { valid: false, error: "Phone number is required" };
  }

  if (cleaned.length !== 10) {
    return { valid: false, error: "Please enter a valid 10-digit phone number" };
  }

  return { valid: true };
};

