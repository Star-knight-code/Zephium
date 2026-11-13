<script lang="ts">
  import { preferences } from "$domain/preferences";
  import * as m from "$shared/i18n/messages";
  import Select from "$shared/ui/Select";
  import SettingsGroup from "$shared/ui/SettingsGroup";
  import SettingsRow from "$shared/ui/SettingsRow";

  type Level = "false" | "true" | "relaxed" | "pay-only";

  // `true` is the first switch's value and stays the careful level, so a
  // choice made before the levels existed is kept. Anything unknown asks,
  // the same reading the core has.
  const LEVELS: ReadonlyArray<{
    value: Level;
    label: () => string;
    description: () => string;
    warning?: () => string;
  }> = [
    { value: "false", label: m.ai_auto_level_ask, description: m.ai_auto_desc_ask },
    {
      value: "true",
      label: m.ai_auto_level_careful,
      description: m.ai_auto_desc,
      warning: m.ai_auto_warning,
    },
    {
      value: "relaxed",
      label: m.ai_auto_level_relaxed,
      description: m.ai_auto_desc_relaxed,
      warning: m.ai_auto_warning_relaxed,
    },
    {
      value: "pay-only",
      label: m.ai_auto_level_pay,
      description: m.ai_auto_desc_pay,
      warning: m.ai_auto_warning_pay,
    },
  ];

  let level = $derived(
    LEVELS.find((entry) => entry.value === preferences.value("ai.auto-approve")) ?? LEVELS[0]!,
  );
</script>

<SettingsGroup title={m.ai_auto_group()} description={m.ai_auto_note()}>
  <SettingsRow
    settingId="ai.auto-approve"
    title={m.ai_auto_title()}
    description={level.description()}
  >
    <Select
      label={m.ai_auto_title()}
      labelHidden
      options={LEVELS.map((entry) => ({ value: entry.value, label: entry.label() }))}
      value={level.value}
      disabled={preferences.saving()}
      onchange={(value) => void preferences.set("ai.auto-approve", value)}
    />
  </SettingsRow>
  {#if level.warning}<p class="warning" role="note">{level.warning()}</p>{/if}
</SettingsGroup>

<style>
  .warning {
    margin: 0;
    padding: 10px 14px 12px;
    font-size: var(--text-label);
    line-height: 1.5;
    color: var(--color-warning);
  }
</style>
