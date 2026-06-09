const { JSDOM } = require("jsdom");
const {
  saveSessionToStorage,
  loadSessionFromStorage,
  STORAGE_KEY
} = require("../src/app.js");

test("storage saves only non-sensitive fields", () => {
  const dom = new JSDOM(``, { url: "http://localhost" });
  global.localStorage = dom.window.localStorage;

  saveSessionToStorage({
    displayName: "Bob",
    role: "user",
    notifications: ["secret"]
  });

  const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
  expect(raw.displayName).toBe("Bob");
  expect(raw.notifications).toBeUndefined();
});

test("loadSessionFromStorage rejects invalid JSON", () => {
  localStorage.setItem(STORAGE_KEY, "UNDEFINED");
  expect(loadSessionFromStorage()).toBeNull();
});
