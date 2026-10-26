import { guestLogin } from "@/app/actions/guest";
import { ActionForm, SubmitButton } from "@/components/forms";
import { site } from "@/config/site";

export const metadata = { title: "Guest Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ email?: string; from?: string }> }) {
  const { email, from } = await searchParams;
  return (
    <section className="container-x grid min-h-[80vh] place-items-center py-16">
      <div className="w-full max-w-md">
        <p className="eyebrow text-center">Welcome back</p>
        <h1 className="mt-3 text-center text-5xl">Your trip awaits</h1>
        <p className="mt-4 text-center text-ink-soft">
          {from === "qr"
            ? "Sign in to see this week's partner offers and your Guest Pass."
            : "Sign in with the email you booked with and the confirmation code from your email."}
        </p>
        <ActionForm action={guestLogin} className="card mt-8 grid gap-4 !bg-white">
          <label><span className="label">Email</span><input name="email" type="email" defaultValue={email} required className="input" autoComplete="email" /></label>
          <label><span className="label">Confirmation code</span><input name="code" required className="input uppercase tracking-widest" placeholder="e.g. K7P2QX" autoComplete="one-time-code" /></label>
          <SubmitButton pendingText="Opening your portal…">Enter the Insider Portal</SubmitButton>
        </ActionForm>
        <p className="mt-6 text-center text-xs text-ink-soft">Can't find your code? Text {site.hostName} at {site.phone}.</p>
      </div>
    </section>
  );
}
