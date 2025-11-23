<script lang="ts">
	import { page } from "$app/state";
	import DateView from "$lib/components/DateView.svelte";
	import Title from "$lib/components/Title.svelte";
	import type { CallItem } from "$lib/server/todCal";
	import { todIsTask, todNext } from "$lib/todUtil";
	import { onMount } from "svelte";
	import Control from "./Control.svelte";
	import ListItem from "./ListItem.svelte";

	// let { data }: PageProps = $props();
	let cal: CallItem[] = $state([]);
	let tasks: CallItem[] = $state([]);
	let loading = $state(true);

	//TODO Do this in load (or maybe try new remote functions? Hmmm)
	function fetchData() {
		loading = true;
		const d = toStartOfDay(new Date());
		let q = new URL("/tod/api/" + d.getTime(), page.url);
		fetch(q)
			.then((r) => r.json()) // TODO Errors
			.then((r: { cal: CallItem[]; from: string; to: string }) => {
				//TODO Use luxon?
				//! All dates are ISO Strings!
				const df = new Date(r.from);
				const dt = new Date(r.to);
				// console.log({ df, dt });
				// console.log(r.cal);

				//Repeat all
				cal = [];
				for (const e of r.cal) {
					//! All dates in r are ISO Strings!
					e.dtStart = new Date(e.dtStart);
					if (e.dtEnd) e.dtEnd = new Date(e.dtEnd);
					if (e.rUntil) e.rUntil = new Date(e.rUntil);
					//In range
					if (df <= e.dtStart || (e.dtEnd && df <= e.dtEnd)) cal.push(e);
					//Tasks outside range
					else if (todIsTask(e)) {
						tasks.push(e);
						continue;
					}
					//Repeats
					for (let t = todNext(e, e.dtStart); t && t.dtStart < dt; t = todNext(t, e.dtStart)) {
						if (df <= t.dtStart) cal.push(t);
					}
				}
				cal.sort((a, b) => a.dtStart.getTime() - b.dtStart.getTime()); //TODO Optimize?
				tasks.sort((a, b) => a.dtStart.getTime() - b.dtStart.getTime());
				loading = false;
			});
	}

	function toStartOfDay(d: Date) {
		const o = new Date(d);
		o.setHours(0, 0, 0, 0);
		return o;
	}

	function isToday(d: Date) {
		// TODO 0 Optimize
		return toStartOfDay(d).getTime() == toStartOfDay(new Date()).getTime();
	}

	onMount(fetchData);
</script>

<Title title="Tod Calendar" />

{#if tasks.length}
	<div id="tasks">
		<div>Tasks:</div>
		{#each tasks as item, i}
			<ListItem {item} />
		{/each}
	</div>
{/if}
<div id="cont">
	{#each cal as item, i}
		<div>
			<!-- TODO 0 Optimize -->
			{#if i == 0 || toStartOfDay(cal[i - 1].dtStart) < toStartOfDay(item.dtStart)}
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
