<script lang="ts" module>
	let s = $state(getDefaultS());
	function getDefaultS(): number {
		const lang = navigator.language; //TODO User overwrite
		const l = navigator.languages.indexOf(lang);
		return l < 0 ? 0 : l;
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	let { date, ...props }: { date: Date } & HTMLAttributes<HTMLSpanElement> = $props();
	let langs = $state(navigator.languages);
	let locale = $derived(langs[Math.floor(s / langs.length)]);
	let useOpts = $derived(s % 2 == 1);

	const dateOpts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "long", year: "numeric" };

	// $inspect(s, locale, useOpts);
</script>

<!-- FIXME a11y span onlick. onclick is also not ideal, its very difficult to select text -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<span
	onclick={(e) => {
		e.preventDefault(); //Prevents following link when inside <a>
		s = (s + 1) % (langs.length * 2);
	}}
	title={date.toString()}
	{...props}
>
	{date.toLocaleDateString(locale, useOpts ? dateOpts : {})}
	{#if date.getHours() > 0 || date.getMinutes() > 0}
		{date.toLocaleTimeString(locale, { hour12: false })}
	{/if}
</span>

<style lang="postcss">
	span {
		cursor: pointer;
	}
</style>
