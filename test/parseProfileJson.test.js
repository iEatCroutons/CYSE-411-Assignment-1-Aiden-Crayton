const { parseProfileJson } = require("../src/app.js");

test("parseProfileJson rejects invalid or unsafe JSON", () => {
  expect(parseProfileJson("UNDEFINED")).toBeNull();
  expect(parseProfileJson("{bad json}")).toBeNull();
});

test("parseProfileJson validates schema and role", () => {
  const valid = JSON.stringify({
    displayName: "Alice",
    role: "admin",
    notifications: ["Welcome"]
  });

  const parsed = parseProfileJson(valid);
  expect(parsed.role).toBe("admin");
  expect(parsed.notifications.length).toBe(1);
});
