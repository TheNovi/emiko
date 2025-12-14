<script lang="ts">
	import { browser } from "$app/environment";
	import { formParseInputDate } from "$lib/util";
	import type { HTMLInputAttributes } from "svelte/elements";
	import DateView from "./DateView.svelte";
	import { DateTime } from "luxon";

	let { name, value = $bindable(), ...opts }: { name: string; value: DateTime | null } & Omit<HTMLInputAttributes, "value"> = $props();

	let showButton = $derived(value && (value.get("hour") > 0 || value.get("minute") > 0));
</script>

{#if !value || browser}
	<input
		type="datetime-local"
		{name}
		id={name}
		bind:value={
			() => formParseInputDate(value?.toJSDate()),
			(v) => {
				value = v ? DateTime.fromISO(v, { zone: value?.zone }) : null;
			}
		}
		{...opts}
	/>
	{#if showButton}
		<button
			type="button"
			hidden={!showButton}
			onclick={() => {
				value = value?.startOf("day") || null;
			}}>Clear Time</button
		>
	{/if}
	{#if value}
		<DateView date={value} style="margin-left: 0.5em" />
	{/if}
{/if}

<style lang="postcss">
	.hidden {
		display: none;
	}
</style>
