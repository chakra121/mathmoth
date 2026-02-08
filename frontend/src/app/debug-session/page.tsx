"use client";

import { useSession } from "next-auth/react";

export default function DebugSession() {
  const { data, status } = useSession();

  return (
    <div className="p-10">
      <h1 className="font-bold text-xl">Session Debug</h1>
      <p>Status: {status}</p>
      <pre className="mt-4 bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}