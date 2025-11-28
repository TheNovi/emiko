<script lang="ts">
	import DateView from "$lib/components/DateView.svelte";
	import Title from "$lib/components/Title.svelte";
	import type { CallItem } from "$lib/server/todCal";
	import { todNext } from "$lib/todUtil";
	import Control from "./Control.svelte";
	import ListItem from "./ListItem.svelte";
	import { DateTime } from "luxon";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	let events: CallItem[] = $derived.by(() => {
		const df = data.from;
		const dt = data.to;
		// console.log(dt.zoneName, df.zoneName);
		// console.log({ df, dt });
		// console.log(r.cal);
		//Repeat all
		const cal = [];
		for (const e of data.events) {
			// console.log(e.dtStart.zoneName);
			//In range
			if (df <= e.dtStart || (e.dtEnd && df <= e.dtEnd)) cal.push(e);
			//Repeats
			for (let t = todNext(e, e.dtStart); t && t.dtStart < dt; t = todNext(t, e.dtStart)) {
				if (df <= t.dtStart) cal.push(t);
			}
		}
		cal.sort((a, b) => a.dtStart.diff(b.dtStart).milliseconds); //TODO Optimize?
		return cal;
	});
	let loading = $state(true); //Unused

	function toStartOfDay(d: DateTime) {
		return d.startOf("day");
	}

	function isToday(d: DateTime) {
		return toStartOfDay(d) == toStartOfDay(DateTime.now());
	}
</script>

<Title title="Tod Calendar" />

{#if data.tasks.length}
	<div id="tasks">
		<div>Tasks:</div>
		{#each data.tasks as item, i}
			<ListItem {item} />
		{/each}
	</div>
{/if}
<div id="cont">
	{#each events as item, i}
		<div>
			<!-- TODO 0 Optimize -->
			{#if i == 0 || toStartOfDay(events[i - 1].dtStart) < toStartOfDay(item.dtStart)}
				<DateView date={toStartOfDay(item.dtStart)} style={isToday(item.dtStart) ? "color: magenta" : ""} />
			{/if}
		</div>
		<ListItem {item} />
	{:else}
		{#if !loading}
			<div>No events found</div>
		{/if}
	{/each}
</div>

<Control>
	<a style="background-color: #333;" href="/tod/0">List</a>
</Control>

<style lang="postcss">
	div {
		text-align: center;
		margin-top: 1em;
		margin-bottom: 1em;
	}

	#cont {
		/* Control height */
		padding-bottom: 3em;
	}
</style>
