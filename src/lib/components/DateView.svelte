<script lang="ts" module>
	let s = $state(getDefaultS());
	function getDefaultS(): number {
		const lang = navigator.language; //TODO User overwrite
		const l = navigator.languages.indexOf(lang);
		return l < 0 ? 0 : l;
	}
</script>

<script lang="ts">
	import type { DateTime } from "luxon";
	import type { HTMLAttributes } from "svelte/elements";

	let { date, onlyTime = false, ...props }: { date: DateTime; onlyTime?: boolean } & HTMLAttributes<HTMLSpanElement> = $props();
	let langs = $state(navigator.languages);
	let locale = $derived(langs[s]);

	const dateOpts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "long", year: "numeric" };
	const timeOpts: Intl.DateTimeFormatOptions = { hour12: false, timeStyle: "short" };

	// $inspect(s, locale);
	// $inspect(date.zoneName);
</script>

<!-- FIXME a11y span onclick. onclick is also not ideal, its very difficult to select text -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<span
	onclick={(e) => {
		e.preventDefault(); //Prevents following link when inside <a>
		s = (s + 1) % langs.length;
	}}
	title={date.toISO()}
	{...props}
>
	{#if onlyTime}
		{date.toLocaleString({ ...timeOpts }, { locale })}
	{:else}
		{date.toLocaleString({ ...dateOpts }, { locale })}
		{#if date.get("hour") > 0 || date.get("minute") > 0}
			{date.toLocaleString({ ...timeOpts }, { locale })}
		{/if}
	{/if}
</span>

<style lang="postcss">
	span {
		cursor: pointer;
	}
</style>
