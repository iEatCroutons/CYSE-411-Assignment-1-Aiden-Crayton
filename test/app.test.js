const { JSDOM } = require("jsdom");

function setupDom(html = "") {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`, {
    url: "http://localhost/"
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.sessionStorage = dom.window.sessionStorage;
  global.fetch = undefined;
  return dom;
}

describe("Secure Status Portal - Unit 1.2 + 1.3", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    setupDom(`
      <ul id="notifications"></ul>
      <span id="status"></span>
    `);
    app = require("../src/app.js");
    localStorage.clear();
    sessionStorage.clear();
  });

  test("sanitizeUsername: allowed chars preserved, others replaced, length max 20", () => {
    expect(app.sanitizeUsername("alice")).toBe("alice");
    expect(app.sanitizeUsername("a<li>ce")).toBe("a_li_ce");
    expect(app.sanitizeUsername("a b c")).toBe("a_b_c");
    expect(app.sanitizeUsername("a@b#c$")).toBe("a_b_c_");
    expect(app.sanitizeUsername("abcdefghijklmnopqrstuvwxyz")).toHaveLength(20);
  });

  test("renderNotifications: uses textContent safely and clears previous content", () => {
    const ul = document.getElementById("notifications");
    ul.innerHTML = "<li>old</li>";

    app.renderNotifications(ul, ["Hello", "<img src=x onerror=alert(1)>"]);
    expect(ul.children.length).toBe(2);
    expect(ul.children[0].textContent).toBe("Hello");
    // Must not interpret HTML
    expect(ul.children[1].innerHTML).toBe("&lt;img src=x onerror=alert(1)&gt;");
  });

  test("parseProfileJson: rejects invalid JSON and invalid shapes", () => {
    expect(app.parseProfileJson("UNDEFINED")).toBeNull();
    expect(app.parseProfileJson("{bad json}")).toBeNull();

    // Missing fields
    expect(app.parseProfileJson(JSON.stringify({ displayName: "A" }))).toBeNull();

    // Wrong types
    expect(app.parseProfileJson(JSON.stringify({
      displayName: "A", role: "user", notifications: "nope"
    }))).toBeNull();

    // Role must be user/admin
    expect(app.parseProfileJson(JSON.stringify({
      displayName: "A", role: "root", notifications: []
    }))).toBeNull();
  });

  test("parseProfileJson: accepts valid profile and normalizes notifications", () => {
    const p = app.parseProfileJson(JSON.stringify({
      displayName: "Alice",
      role: "admin",
      notifications: ["Welcome", "Update"]
    }));
    expect(p).not.toBeNull();
    expect(p.displayName).toBe("Alice");
    expect(p.role).toBe("admin");
    expect(p.notifications).toEqual(["Welcome", "Update"]);
  });

  test("computeAccessStatus: GRANTED only for admin role", () => {
    expect(app.computeAccessStatus({ role: "user" })).toBe("DENIED");
    expect(app.computeAccessStatus({ role: "admin" })).toBe("GRANTED");
  });

  test("save/load session: stores only displayName + role, valid JSON only", () => {
    const profile = { displayName: "Bob", role: "user", notifications: ["secret"] };
    app.saveSessionToStorage(profile);

    const raw = localStorage.getItem(app.STORAGE_KEY);
    expect(typeof raw).toBe("string");

    const obj = JSON.parse(raw);
    expect(obj.displayName).toBe("Bob");
    expect(obj.role).toBe("user");
    expect(obj.notifications).toBeUndefined();

    const loaded = app.loadSessionFromStorage();
    expect(loaded).toEqual({ displayName: "Bob", role: "user" });
  });

  test("loadSessionFromStorage: returns null on missing or invalid JSON", () => {
    expect(app.loadSessionFromStorage()).toBeNull();
    localStorage.setItem(app.STORAGE_KEY, "UNDEFINED");
    expect(app.loadSessionFromStorage()).toBeNull();
  });

  test("fetchUserProfile: uses fetch + parseProfileJson and returns profile or null", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      text: async () => JSON.stringify({
        displayName: "Alice",
        role: "user",
        notifications: ["Welcome"]
      })
    }));

    const p = await app.fetchUserProfile("/mock/profile.json");
    expect(fetch).toHaveBeenCalled();
    expect(p.displayName).toBe("Alice");
  });

  test("fetchUserProfile: returns null on non-ok response or invalid JSON", async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      text: async () => "nope"
    }));
    expect(await app.fetchUserProfile("/x")).toBeNull();

    global.fetch = jest.fn(async () => ({
      ok: true,
      text: async () => "UNDEFINED"
    }));
    expect(await app.fetchUserProfile("/x")).toBeNull();
  });
});
