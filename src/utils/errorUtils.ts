export const humanizeError = (error: any, context: string = ""): string => {
  const rawMessage = error?.message || String(error);
  
  // Auth Errors
  if (rawMessage.includes("Invalid login credentials")) {
    return "Oops! That email or password doesn't look right. Please double-check and try again.";
  }
  if (rawMessage.includes("Email not confirmed")) {
    return "Your email hasn't been verified yet. Please check your inbox for a verification code.";
  }
  if (rawMessage.includes("User already registered")) {
    return "This email is already in use. Maybe try logging in instead?";
  }
  if (rawMessage.includes("Token has expired") || rawMessage.includes("OTP has expired")) {
    return "The verification code has expired. Please request a new one.";
  }
  if (rawMessage.includes("database error") || rawMessage.includes("Invalid syntax")) {
    return "Something went wrong on our end. We're looking into it!";
  }
  if (rawMessage.toLowerCase().includes("network") || rawMessage.includes("Failed to fetch")) {
    return "Connection lost! Please check your internet and try again.";
  }
  if (rawMessage.includes("User not found")) {
    return "We couldn't find an account with that email.";
  }

  // Context-specific fallbacks
  if (context.toLowerCase().includes("customer")) return "We couldn't find a customer profile for this account. Are you sure you're in the right place?";
  if (context.toLowerCase().includes("vendor")) return "This account isn't registered as a vendor. Please use the customer login if you're looking to order!";
  if (context.toLowerCase().includes("rider")) return "Rider profile not found. If you're a rider, please make sure you've completed your registration.";
  if (context.toLowerCase().includes("incomplete parameters")) return "Please fill in all the required details before continuing!";
  
  return rawMessage.length > 5 ? rawMessage : (context || "An unexpected error occurred. Please try again later.");
};
