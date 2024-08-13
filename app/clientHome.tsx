"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./components/ui/button";
import LandingPage from "./landingPage";
import FormsList from "./formsList";
import { Form, FormsApiResponse } from "./types/forms";

import { signIn, signOut } from "next-auth/react";

export default function ClientHome({ initialSession }) {
  const [forms, setForms] = useState<Form[]>([]);
  const [session, setSession] = useState(initialSession);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      getForms();
    }
  }, [session]);

  const getForms = async () => {
    setIsLoading(true);
    const forms: FormsApiResponse = await fetch("/api/typeform/getforms").then(
      (resp) => resp.json()
    );
    console.log(forms);
    if (forms) {
      console.log("setforms", forms.items);
      setForms(forms.items);
      setIsLoading(false);
    }
  };

  const printForm = async (formId) => {
    console.log("formId", formId);
    const pdf = await fetch(`/api/typeform/printform?form_id=${formId}`).then(
      (resp) => resp.json()
    );
    console.log("pdf", pdf);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Typeform2PDF</h1>
          {session ? (
            <button
              className="bg-transparent text-red-500 border border-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition"
              onClick={() => signOut()}
            >
              Logout
            </button>
          ) : (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => signIn("typeform")}
            >
              Sign In
            </button>
          )}
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full h-full flex items-center justify-center border-y bg-primary py-8">
          {session ? (
            <FormsList forms={forms} isLoading={isLoading} />
          ) : (
            <LandingPage />
          )}
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-primary">
        <p className="text-xs text-primary-foreground">
          &copy; 2024 Nicolas Grenié
        </p>
        {/* <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-primary-foreground"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-primary-foreground"
            prefetch={false}
          >
            Privacy
          </Link>
        </nav> */}
      </footer>
    </div>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
