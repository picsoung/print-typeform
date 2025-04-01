import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";

import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
  }
}

export interface TypeformSession extends DefaultSession {
  accessToken?: string;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  console.log(' getforms session',session)

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const response = await fetch("https://api.typeform.com/forms?page_size=200", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch forms from Typeform');
    }

    const data = await response.json();
    console.log("response", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]";

// const getForms = async (req, res) => {
//   // call typeform API
//   // https://api.typeform.com/forms
//   const session = await getServerSession(req, res, authOptions);
//   if (!session) {
//     res.send({ error: "Not authorized" });
//   }

//   let response = await fetch("https://api.typeform.com/forms?page_size=200", {
//     headers: { Authorization: `Bearer ${session.accessToken}` },
//   }).then((response) => response.json());
//   console.log("response", response);
//   res.json(response);
// };

// export default getForms;