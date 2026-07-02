import Link from "next/link";

import AuthCard from "@/components/cui/auth/AuthCard";
import RegisterForm from "@/common/form/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Fill in your details to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
