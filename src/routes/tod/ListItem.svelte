<script lang="ts">
	import DateView from "$lib/components/DateView.svelte";
	import type { DateTime } from "luxon";

	type TItem = { id: number; title: string; state: number; dtStart: DateTime | null; dtEnd: DateTime | null; rFreq: number | null; rInterval: number | null; rUntil: DateTime | null };
	let { item }: { item: TItem } = $props();

	let freq = $derived.by(() => {
		const r = item.rInterval ? item.rInterval : 0;
		switch (item.rFreq) {
			case 1: //Days
				return r ? `${r}d` : "";
			case 2: //Week
				return;
			case 3: //Month
				return "m";
			case 4: //Year
				return `y`;
			default:
				return "";
		}
	});
</script>

<!-- TODO 10 Internet says its not good idea to have other clickable items inside <a>. So either make only title part link. Or inspire from how reddit has done it -->
<a href={`/tod/${item.id}`} class={["item", ["done", "open", "process"][item.state]]}>
	<span>{item.title}</span>
	{#if item.dtStart}
		<span>
			<DateView date={item.dtStart} />
			{#if item.dtEnd}
				- <DateView date={item.dtEnd} onlyTime={item.dtEnd.diff(item.dtStart, "days").days < 1} />
			{/if}
		</span>
		{#if freq}
			<span>r: {freq}</span>
			{#if item.rUntil}
				<span>until: <DateView date={item.rUntil} /> </span>
			{/if}
		{/if}
	{/if}
</a>

<style lang="postcss">
	.item {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 1em;
		background-color: #222;
		border-radius: 0.5em;
		padding: 0.5em;
		margin-bottom: 0.5em;
	}

	.done {
		color: green;
	}
	.open {
		color: inherit;
	}
	.process {
		color: yellow;
	}
</style>
