import { getSession } from "next-auth/react";

export default async (req, res) => {
  // call typeform API
  // https://api.typeform.com/forms

  const session = await getSession({ req });
  console.log('session', session)
  if (!session) {
    res.send({ eror: "Not authorized" });
  }

  let response = await fetch("https://api.typeform.com/forms?page_size=200", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  }).then((response) => response.json());
  console.log('response', response)
  res.json(response)
};
