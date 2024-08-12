"use client";

import { signIn } from "next-auth/react";

export const SignInButton = ({ children }: any) => {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      type="button"
      onClick={() => signIn()}
    >
      Sign in with Typeform
    </button>
  );
};
