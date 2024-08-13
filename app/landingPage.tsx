import { SignInButton } from "./components/sign-in";
export default function LandingPage() {
  return (
    <div className="px-4 md:px-6 space-y-10 xl:space-y-16">
      <div className="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
        <div>
          <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] text-primary-foreground">
            Print your Typeform surveys to PDF
          </h1>
          <p className="mx-auto max-w-[700px] text-primary-foreground md:text-xl">
            Easily convert your Typeform surveys to PDF with our simple and
            secure tool.
          </p>
          <div className="mt-6">
            <SignInButton />
          </div>
        </div>
        <div className="hidden md:block">
          <img
            src="/typeform2pdf.png"
            width="550"
            height="310"
            alt="Hero"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}
