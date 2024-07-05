import NextAuth from "next-auth";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    {
      id: "typeform",
      name: "typeform",
      type: "oauth",
      authorization: {
        params: { scope: "accounts:read forms:read" },
        url: "https://api.typeform.com/oauth/authorize",
      },
      token: "https://api.typeform.com/oauth/token",
      userinfo: "https://api.typeform.com/me",
      profile(profile, tokens) {
        console.log("profile", profile);
        return {
          id: profile.user_id,
          email: profile.email,
          alias: profile.alias,
        };
      },
      clientId: process.env.TYPEFORM_CLIENT_ID,
      clientSecret: process.env.TYPEFORM_CLIENT_SECRET,
    },
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
export default NextAuth(authOptions);
