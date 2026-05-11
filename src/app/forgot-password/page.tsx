import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | kan.bn",
  description: "Reset your password for kan.bn",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
