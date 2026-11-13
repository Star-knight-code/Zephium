import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import AssistApproval from "../components/AssistApproval.svelte";

const native = vi.hoisted(() => ({ value: undefined as string | undefined, set: vi.fn() }));

vi.mock("$domain/preferences", () => ({
  preferences: { value: () => native.value, saving: () => false, set: native.set },
}));

beforeEach(() => native.set.mockClear());

test("the assistant asks until a level is chosen, and choosing one stores it", async () => {
  native.value = undefined;
  const screen = await render(AssistApproval);
  const level = screen.getByRole("button", { name: "Run steps without asking" });
  await expect.element(level).toHaveTextContent("Always ask");
  await expect
    .element(screen.getByText("The assistant asks before every step", { exact: false }))
    .toBeVisible();
  expect(screen.getByRole("note").elements()).toHaveLength(0);

  await level.click();
  await page.getByRole("option", { name: "Relaxed" }).click();
  expect(native.set).toHaveBeenCalledWith("ai.auto-approve", "relaxed");
});

test("the first switch's stored value stays the careful level", async () => {
  native.value = "true";
  const screen = await render(AssistApproval);
  await expect
    .element(screen.getByRole("button", { name: "Run steps without asking" }))
    .toHaveTextContent("Careful");
  await expect
    .element(screen.getByText("It asks before it sends, buys, deletes", { exact: false }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("note"))
    .toHaveTextContent("Automatic approval is on. A page can try to steer the assistant");
});

test.each([
  ["relaxed", "Relaxed", "send messages and posts in your name without a check"],
  ["pay-only", "Only ask before paying", "what it deletes may not come back"],
])("%s names what now runs unchecked", async (stored, label, warning) => {
  native.value = stored;
  const screen = await render(AssistApproval);
  await expect
    .element(screen.getByRole("button", { name: "Run steps without asking" }))
    .toHaveTextContent(label);
  await expect.element(screen.getByRole("note")).toHaveTextContent(warning);
});

test("a value nobody offers reads as asking", async () => {
  native.value = "everything";
  const screen = await render(AssistApproval);
  await expect
    .element(screen.getByRole("button", { name: "Run steps without asking" }))
    .toHaveTextContent("Always ask");
});
