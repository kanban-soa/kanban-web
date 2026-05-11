import ResetPasswordForm from "@/components/auth/reset-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | kan.bn",
  description: "Set a new password for kan.bn",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
