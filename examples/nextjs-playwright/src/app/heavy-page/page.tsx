type HeavyDataResponse = {
  headers: Record<string, string>;
};

async function loadHeavyData() {
  // Simulating a heavy load with a delay
  const res = await fetch('https://httpbin.org/delay/1');
  const data: HeavyDataResponse = await res.json();

  return data;
}

export default async function Page() {
  const data = await loadHeavyData();

  return (
    <>
      <h2>Heavy page</h2>
      <p>This page takes at least 1 second to load.</p>
      <ul>
        {Object.entries(data.headers).map(([key, value]) => (
          <li key={key}>
            {key}: {value}
          </li>
        ))}
      </ul>
      {/* Embed raw response in non-production environments */}
      {process.env.NODE_ENV !== 'production' && (
        <script id="data-response" type="application/json">
          {JSON.stringify(data)}
        </script>
      )}
    </>
  );
}
