"use client";

import { createContext, startTransition, useActionState, useContext, type ReactNode } from "react";

type State = { error: string } | null;

const PendingContext = createContext(false);

// Server-action form that shows the first error returned. Submits manually so React
// doesn't reset the fields on error — guests keep what they typed and checked.
export function ActionForm({
  action,
  children,
  className,
}: {
  action: (prev: State, form: FormData) => Promise<State>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <PendingContext.Provider value={pending}>{children}</PendingContext.Provider>
      {state?.error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{state.error}</p>}
    </form>
  );
}

export function SubmitButton({ children, pendingText, className = "btn-primary w-full" }: { children: ReactNode; pendingText?: string; className?: string }) {
  const pending = useContext(PendingContext);
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText ?? "One moment…" : children}
    </button>
  );
}
