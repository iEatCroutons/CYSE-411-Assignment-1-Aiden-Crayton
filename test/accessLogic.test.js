const { computeAccessStatus } = require("../src/app.js");

test("access is granted only for admin role", () => {
  expect(computeAccessStatus({ role: "user" })).toBe("DENIED");
  expect(computeAccessStatus({ role: "admin" })).toBe("GRANTED");
});
