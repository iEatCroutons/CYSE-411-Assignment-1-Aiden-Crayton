const fs = require("fs");
const path = require("path");
const { sanitizeUsername } = require("../src/app.js");

// Lê o código fonte do arquivo app.js como texto puro
const appSourceCode = fs.readFileSync(
  path.resolve(__dirname, "../src/app.js"),
  "utf8"
);

describe("Sanitize Username - Security and Implementation Checks", () => {
  
  // 1. O SEU TESTE ORIGINAL (Garante que o comportamento funciona)
  test("sanitizeUsername removes unsafe characters and limits length", () => {
    expect(sanitizeUsername("alice")).toBe("alice");
    expect(sanitizeUsername("a<li>ce")).toBe("a_li_ce");
    expect(sanitizeUsername("a b c")).toBe("a_b_c");
    expect(sanitizeUsername("a@b#c$")).toBe("a_b_c_");
    expect(sanitizeUsername("abcdefghijklmnopqrstuvwxyz").length).toBe(20);
  });

  // 2. O NOVO TESTE DE INSPEÇÃO (Garante que ele usou REGEX)
  test("STRICT CHECK: Solution must utilize Regular Expressions (Regex)", () => {
    // Procura por literais de regex (ex: /[^a-z]/) ou pelo construtor new RegExp()
    const usesRegexLiteral = /\/[^/\n]+\/[gimy]*\.test|replace|match/.test(appSourceCode);
    const usesRegExpConstructor = /new\s+RegExp/.test(appSourceCode);

    const implementsRegex = usesRegexLiteral || usesRegExpConstructor;

    expect(implementsRegex).toBe(true);
  });
});