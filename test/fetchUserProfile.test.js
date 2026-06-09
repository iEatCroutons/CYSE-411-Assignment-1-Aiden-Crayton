const { fetchUserProfile } = require("../src/app.js");

test("fetchUserProfile returns profile on valid fetch", async () => {
  global.fetch = async () => ({
    ok: true,
    text: async () => JSON.stringify({
      displayName: "Alice",
      role: "user",
      notifications: []
    })
  });

  const profile = await fetchUserProfile("/mock");
  expect(profile.displayName).toBe("Alice");
});

test("fetchUserProfile returns null on failure", async () => {
  global.fetch = async () => ({ ok: false });
  expect(await fetchUserProfile("/mock")).toBeNull();
});
