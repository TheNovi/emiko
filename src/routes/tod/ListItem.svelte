<script lang="ts">
	import DateView from "$lib/components/DateView.svelte";
	import FormInput from "$lib/components/FormInput.svelte";
	import { todIsTask } from "$lib/todUtil";
	import type { DateTime } from "luxon";

	type TItem = {
		id: number;
		title: string;
		state: number;
		dtStart: DateTime | null;
		dtEnd: DateTime | null;
		rFreq: number | null;
		rInterval: number | null;
		rUntil: DateTime | null;
		eventType?: number;
	};
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

{#snippet offset()}
	<a class="offset" aria-label={`empty space with link to item`} href={`/tod/${item.id}`}></a>
{/snippet}

<div class={["item", ["done", "open", "process"][item.state]]}>
	{@render offset()}
	<a href={`/tod/${item.id}`}>{item.title}</a>
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
		{#if todIsTask(item)}
			<!-- TODO As remote function -->
			<form method="post">
				<FormInput type="hidden" name="id" value={item.id} />
				<button formaction="?/completeTask" type="submit">Task Complete</button>
			</form>
		{/if}
	{/if}
	{@render offset()}
</div>

<style lang="postcss">
	.item {
		display: flex;
		flex-direction: row;
		justify-content: center;
		/* gap: 1em; */
		background-color: #222;
		border-radius: 0.5em;
		margin-bottom: 0.5em;
	}

	.item .offset {
		flex-grow: 1;
	}

	.item span,
	.item a {
		padding: 0.5em;
		/* padding-top: 0.5em;
		padding-bottom: 0.5em; */
	}

	button {
		padding-top: 0.5em;
		padding-bottom: 0.5em;
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
