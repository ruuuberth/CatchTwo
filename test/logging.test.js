// Tests for src/functions/logging.js sendLog style routing (issue #16).
// Stubs pokehint/discord-self-lite via a temporary Module._load hook so the
// module loads without network or real webhook clients; console.log is spied
// to capture exactly what each sendLog type renders.
const { test } = require("node:test");
const assert = require("node:assert");
const Module = require("node:module");

const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === "pokehint") {
    return { checkRarity: async () => "Regular", getImage: async () => "" };
  }
  if (request === "discord-self-lite") {
    return { WebhookClient: class {} };
  }
  return origLoad.call(Module, request, ...rest);
};
const { sendLog } = require("../src/functions/logging.js");
Module._load = origLoad;

const chalk = require("chalk");
chalk.level = 3; // force ANSI codes even without a TTY so styles are assertable

const config = require("../config");

// Each entry: the exact ANSI prefix chalk must render for [TYPE], plus whether
// the username segment is included in that branch of the switch.
const cases = [
  { type: "info", prefix: "\x1b[1m\x1b[34m[INFO]", user: false },
  { type: "error", prefix: "\x1b[1m\x1b[31m[ERROR]", user: false },
  { type: "warning", prefix: "\x1b[1m\x1b[33m[WARNING]", user: false },
  { type: "catch", prefix: "\x1b[36m[CATCH]", user: true },
  { type: "special catch", prefix: "\x1b[1m\x1b[36m[SPECIAL CATCH]", user: true },
  { type: "captcha", prefix: "\x1b[1m\x1b[31m[CAPTCHA]", user: true },
  // incense and auto-incense must share the bold green style (issue #9 fix)
  { type: "incense", prefix: "\x1b[1m\x1b[32m[INCENSE]", user: true },
  { type: "auto-incense", prefix: "\x1b[1m\x1b[32m[AUTO-INCENSE]", user: true },
  { type: "quest", prefix: "\x1b[38;2;247;166;59m\x1b[1m[QUEST]", user: true },
  { type: "debug", prefix: "\x1b[1m\x1b[35m[DEBUG]", user: true },
  { type: "some-unknown", prefix: "\x1b[1m\x1b[34m[SOME-UNKNOWN]", user: true },
];

for (const { type, prefix, user } of cases) {
  test(`sendLog routes "${type}" to its style`, (t) => {
    const spy = t.mock.method(console, "log", () => {});
    sendLog("Ash", "hello world", type);
    assert.strictEqual(spy.mock.callCount(), 1);
    const out = spy.mock.calls[0].arguments[0];
    assert.match(
      out,
      new RegExp(
        `^${prefix.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&")}` +
          `(?:\\x1b\\[\\d+m)+ - \\x1b\\[37m\\x1b\\[1m\\d{2}:\\d{2}(?:\\x1b\\[\\d+m)+: ` +
          (user ? "\\x1b\\[1m\\x1b\\[31mAsh(?:\\x1b\\[\\d+m)+: " : "") +
          `hello world$`
      )
    );
    if (!user) assert.ok(!out.includes("Ash"));
  });
}

test("sendLog accepts uppercase types via toLowerCase", (t) => {
  const spy = t.mock.method(console, "log", () => {});
  sendLog("Ash", "hello", "INFO");
  assert.match(spy.mock.calls[0].arguments[0], /^\x1b\[1m\x1b\[34m\[INFO\]/);
});

test("sendLog skips debug output when config.debug is disabled", (t) => {
  const original = config.debug;
  config.debug = false;
  try {
    const spy = t.mock.method(console, "log", () => {});
    sendLog("Ash", "hello", "debug");
    assert.strictEqual(spy.mock.callCount(), 0);
  } finally {
    config.debug = original;
  }
});
