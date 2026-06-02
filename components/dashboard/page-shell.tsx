"use client";

import { ReactNode } from "react";
import Sidebar from "./sidebar";

type Props = {
  children: ReactNode;
};

export default function PageShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}