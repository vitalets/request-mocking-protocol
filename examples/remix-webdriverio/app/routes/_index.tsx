import { json } from '@remix-run/node'; // or cloudflare/deno
import { useLoaderData } from '@remix-run/react';

type User = {
  id: number;
  name: string;
};

export async function loader() {
  // wating remix middleware!
  // https://github.com/remix-run/remix/discussions/7642
  // const res = await fetch('https://jsonplaceholder.typicode.com/users');
  // const users: User[] = await res.json();

  return json([{ id: 1, name: 'John Smith' }]);
}

export default function Index() {
  const users = useLoaderData<typeof loader>();

  return (
    <>
      <h2>Users:</h2>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </>
  );
}
