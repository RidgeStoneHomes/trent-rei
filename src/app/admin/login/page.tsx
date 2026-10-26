import { adminLogin } from "@/app/actions/admin";
import { ActionForm, SubmitButton } from "@/components/forms";

export const metadata = { title: "Host Login", robots: { index: false } };

export default function AdminLogin() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4">
      <ActionForm action={adminLogin} className="w-full max-w-sm rounded-2xl bg-sand p-8">
        <p className="eyebrow">Host Dashboard</p>
        <h1 className="mt-2 text-4xl">Welcome back</h1>
        <label className="mt-6 block"><span className="label">Password</span><input name="password" type="password" required className="input" autoFocus /></label>
        <div className="mt-5"><SubmitButton>Sign in</SubmitButton></div>
      </ActionForm>
    </main>
  );
}
