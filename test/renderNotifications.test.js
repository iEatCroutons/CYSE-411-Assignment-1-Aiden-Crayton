const { JSDOM } = require("jsdom");
const { renderNotifications } = require("../src/app.js");

test("renderNotifications uses textContent and clears old nodes", () => {
  const dom = new JSDOM(`<ul id="n"><li>old</li></ul>`);
  global.document = dom.window.document;

  const ul = document.getElementById("n");
  renderNotifications(ul, ["Hello", "<img src=x onerror=alert(1)>"]);

  expect(ul.children.length).toBe(2);
  expect(ul.children[0].textContent).toBe("Hello");
  expect(ul.children[1].innerHTML)
    .toBe("&lt;img src=x onerror=alert(1)&gt;");
});
