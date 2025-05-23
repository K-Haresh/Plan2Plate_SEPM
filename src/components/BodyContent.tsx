'use client';

import Header from "@/components/Header";

export default function BodyContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  );
} 