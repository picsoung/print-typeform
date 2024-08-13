import Link from "next/link";
import { Form, FormsApiResponse } from "./types/forms";
export default function FormsList({ forms, isLoading }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-50">My Forms</h2>
      <p className="text-muted-foreground">Pick a form to print</p>
      <div className="space-y-2">
        {isLoading && (
          <div className="group rounded-lg p-4 transition-colors animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 bg-muted-foreground/20 rounded-md w-32" />
                <div className="h-4 bg-muted-foreground/20 rounded-md w-24" />
              </div>
              <div className="h-5 bg-muted-foreground/20 rounded-md w-5" />
            </div>
          </div>
        )}
        {forms &&
          forms.length > 0 &&
          forms.map((f) => (
            <div
              key={f.id}
              className="group bg-muted hover:bg-sky-400 hover:ring-sky-400 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Link href={`/api/typeform/printform?form_id=${f.id}`}>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.id}</p>
                  </div>
                </Link>
                <Link href={`/api/typeform/printform?form_id=${f.id}`}>
                  <div className="text-primary group-hover:text-primary-foreground transition-colors">
                    <PrinterIcon className="w-5 h-5" />
                  </div>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function PrinterIcon(props) {
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
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  );
}
