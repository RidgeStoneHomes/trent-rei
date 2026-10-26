import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-sand px-4 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-5xl">This path leads to open water.</h1>
        <Link href="/" className="btn-primary mt-8">Back to shore</Link>
      </div>
    </main>
  );
}
