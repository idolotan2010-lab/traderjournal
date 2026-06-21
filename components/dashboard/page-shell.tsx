"use client";

import { ReactNode } from "react";
import Sidebar from "./sidebar";

type Props = {
  children: ReactNode;
};

export default function PageShell({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-[#050811] text-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_28%),radial-gradient(circle_at_top_left,rgba(34,211,238,0.07),transparent_24%),#050811] px-7 py-6">
          <div className="mx-auto w-full max-w-[1480px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}