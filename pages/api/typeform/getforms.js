import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
export default async (req, res) => {
  // call typeform API
  // https://api.typeform.com/forms
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.send({ error: "Not authorized" });
  }

  let response = await fetch("https://api.typeform.com/forms?page_size=200", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  }).then((response) => response.json());
  console.log("response", response);
  res.json(response);
};
