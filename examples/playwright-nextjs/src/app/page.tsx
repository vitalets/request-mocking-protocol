type User = {
  id: number;
  name: string;
};

async function loadUsers() {
  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  const users: User[] = await res.json();

  return users;
}

export default async function Home() {
  const users = await loadUsers();

  return (
    <>
      <h2>Users:</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </>
  );
}
