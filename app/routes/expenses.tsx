import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUsers } from "~/models/user.server";

export const loader: LoaderFunction = async() => {
  const users = await getUsers()
  return json({users})
}


export default function ExpensesRoute() {

  const { users } = useLoaderData()
  console.log(users)

  return (
    <div>
      <h1>Welcome to Blah</h1>
   
    </div>
  );
}
