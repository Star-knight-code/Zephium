import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import AssistApproval from "../components/AssistApproval.svelte";

const native = vi.hoisted(() => ({ value: undefined as string | undefined, set: vi.fn() }));

vi.mock("$domain/preferences", () => ({
  preferences: { value: () => native.value, saving: () => false, set: native.set },
}));

test("automatic approval is off until asked for and carries no warning", async () => {
  native.value = undefined;
  const screen = await render(AssistApproval);
  const toggle = screen.getByRole("switch", { name: "Run steps without asking" });
  await expect.element(toggle).not.toBeChecked();
  expect(screen.getByRole("note").elements()).toHaveLength(0);

  await toggle.click();
  expect(native.set).toHaveBeenCalledWith("ai.auto-approve", "true");
});

test("switched on, it says what still waits and what to watch for", async () => {
  native.value = "true";
  const screen = await render(AssistApproval);
  await expect
    .element(screen.getByRole("switch", { name: "Run steps without asking" }))
    .toBeChecked();
  await expect
    .element(screen.getByText("It still asks before it sends, buys, deletes", { exact: false }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("note"))
    .toHaveTextContent("Automatic approval is on. A page can try to steer the assistant");
});
