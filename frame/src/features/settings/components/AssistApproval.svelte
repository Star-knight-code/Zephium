<script lang="ts">
  import { preferences } from "$domain/preferences";
  import * as m from "$shared/i18n/messages";
  import SettingsGroup from "$shared/ui/SettingsGroup";
  import SettingsRow from "$shared/ui/SettingsRow";
  import Switch from "$shared/ui/Switch";

  // Off unless the stored value says otherwise, the same reading the core has.
  let on = $derived(preferences.value("ai.auto-approve") === "true");
</script>

<SettingsGroup title={m.ai_auto_group()} description={m.ai_auto_note()}>
  <SettingsRow settingId="ai.auto-approve" title={m.ai_auto_title()} description={m.ai_auto_desc()}>
    <Switch
      label={m.ai_auto_title()}
      labelHidden
      checked={on}
      disabled={preferences.saving()}
      onchange={(value) => void preferences.set("ai.auto-approve", String(value))}
    />
  </SettingsRow>
  {#if on}<p class="warning" role="note">{m.ai_auto_warning()}</p>{/if}
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
