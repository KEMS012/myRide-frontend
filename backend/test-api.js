const BASE = process.env.BASE_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function test() {
  let passed = 0;
  let failed = 0;

  const check = async (name, fn) => {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ ${name}: ${err.message}`);
      failed++;
    }
  };

  await check("GET /health returns ok", async () => {
    const { status, data } = await request("/health");
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (data.status !== "ok") throw new Error(`Expected status ok, got ${data.status}`);
  });

  await check("GET /api/users returns array", async () => {
    const { status, data } = await request("/api/users");
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(data)) throw new Error(`Expected array, got ${typeof data}`);
  });

  await check("GET /api/rides returns array", async () => {
    const { status, data } = await request("/api/rides");
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(data)) throw new Error(`Expected array, got ${typeof data}`);
  });

  await check("GET /api/partners returns array", async () => {
    const { status, data } = await request("/api/partners");
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(data)) throw new Error(`Expected array, got ${typeof data}`);
  });

  await check("GET /api/programs returns array", async () => {
    const { status, data } = await request("/api/programs");
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(data)) throw new Error(`Expected array, got ${typeof data}`);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

test();
