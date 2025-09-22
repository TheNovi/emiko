<script lang="ts">
	import { formParseInputDate } from "$lib/util";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { SvelteDate } from "svelte/reactivity";
	import DateView from "./DateView.svelte";

	let { name, value = $bindable(), ...opts }: { name: string; value: Date | SvelteDate | null } & Omit<HTMLInputAttributes, "value"> = $props();

	let showButton = $derived(value && (value.getHours() > 0 || value.getMinutes() > 0));
</script>

<input
	type="datetime-local"
	{name}
	id={name}
	bind:value={
		() => formParseInputDate(value),
		(v) => {
			value = v ? new SvelteDate(v) : null;
		}
	}
	{...opts}
/>
{#if showButton}
	<button type="button" hidden={!showButton} onclick={() => value?.setHours(0, 0, 0, 0)}>Clear Time</button>
{/if}
{#if value}
	<DateView date={value} style="margin-left: 0.5em" />
{/if}

<style lang="postcss">
	.hidden {
		display: none;
	}
</style>
