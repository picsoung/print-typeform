import NextAuth from "next-auth";
 
export const { handlers, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    {
      id: "typeform", // signIn("my-provider") and will be part of the callback URL
      name: "Typeform", // optional, used on the default login page as the button text.
      type: "oauth", // or "oauth" for OAuth 2 providers
      clientId: process.env.AUTH_TYPEFORM_ID, // from the provider's dashboard
      clientSecret: process.env.AUTH_TYPEFORM_SECRET, // from the provider's dashboard
      authorization: {
        url: "https://api.typeform.com/oauth/authorize",
        params: { scope: "accounts:read forms:read" },
      },
      checks:["none"],
      token: "https://api.typeform.com/oauth/token",
      userinfo: "https://api.typeform.com/me",
      async profile(profile, tokens) {
        return {
          id: profile.user_id,
          email: profile.email,
          alias: profile.alias,
          accessToken: tokens.access_token || "", // Add this line
        };
      },
    },
  ],
  callbacks: {
    jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
