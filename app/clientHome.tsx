'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton } from "./components/sign-in";
import { Button } from "./components/ui/button";

interface Form {
  id: string;
  title: string;
}

interface FormsApiResponse {
  items: Form[];
}

export default function ClientHome({ initialSession }) {
  const [forms, setForms] = useState<Form[]>([]);
  const [session, setSession] = useState(initialSession);

  useEffect(() => {
    if (session) {
      getForms();
    }
  }, [session]);

  const getForms = async () => {
    const forms: FormsApiResponse = await fetch("/api/typeform/getforms").then(
      (resp) => resp.json()
    );
    console.log(forms);
    if (forms) {
      console.log("setforms", forms.items);
      setForms(forms.items);
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
      <main className="flex-1">
        <section className="w-full h-full flex items-center justify-center border-y bg-primary">
          <div className="px-4 md:px-6 space-y-10 xl:space-y-16">
            <div className="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
              <div>
                <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] text-primary-foreground">
                  Print your Typeform surveys to PDF
                </h1>
                <p className="mx-auto max-w-[700px] text-primary-foreground md:text-xl">
                  Easily convert your Typeform surveys to PDF with our simple
                  and secure tool.
                </p>
                <div className="mt-6">
                  <SignInButton />
                </div>
                <div className="mt-6">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Button
                  </button>
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="/placeholder.svg"
                  width="550"
                  height="310"
                  alt="Hero"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        {session && (
          <ul>
            {forms.map((f) => (
              <li key={f.id}>
                <Link href={`/api/typeform/printform?form_id=${f.id}`}>
                  {f.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-primary">
        <p className="text-xs text-primary-foreground">
          &copy; 2024 Acme Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
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
        </nav>
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