import "@/styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AI Patent Writer",
  description: "Search, analyze, and generate patent-ready drafts",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="max-w-7xl mx-auto p-6">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-black text-white grid place-items-center font-bold">?</div>
              <h1 className="text-xl font-semibold">AI Patent Writer</h1>
            </div>
            <nav className="text-sm text-gray-600">
              <a href="https://agentic-13b8f5e1.vercel.app" className="hover:underline">Production</a>
            </nav>
          </header>
          {children}
          <footer className="mt-10 text-xs text-gray-500">For educational use; not legal advice.</footer>
        </div>
      </body>
    </html>
  );
}
