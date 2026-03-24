import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Page not found</p>
      <Link href="/" className="mt-6 px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dark shadow-lg shadow-accent/20 transition-all">
        Go Home
      </Link>
    </div>
  );
}
