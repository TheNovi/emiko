<script lang="ts">
	import { page } from "$app/state";
	import Header from "$lib/components/Header.svelte";
	import type { CallItem } from "$lib/server/todCal";
	import { onMount } from "svelte";
	import Control from "./Control.svelte";
	import ListItem from "./ListItem.svelte";
	import DateView from "$lib/components/DateView.svelte";

	// let { data }: PageProps = $props();
	let cal: CallItem[] = $state([]);
	let loading = $state(true);

	function fetchData() {
		loading = true;
		// console.log('fetching', currentOffset);
		const d = new Date();
		d.setHours(0, 0, 0, 0); //This part is crucial, because it creates date with client's timezone. And its main reason why this cant be send in props
		let q = new URL("/tod/api/" + d.getTime(), page.url);
		fetch(q) //TODO As svelte remote function (when they become stable)
			.then((r) => r.json()) // TODO Errors
			.then((r: { cal: CallItem[]; from: string; to: string }) => {
				//All dates in r are ISO Strings
				const df = new Date(r.from);
				const dt = new Date(r.to);
				// console.log({ df, dt });

				cal = [];
				//Repeat all
				for (const e of r.cal) {
					e.dtStart = new Date(e.dtStart); //FIXME Is this necessary?
					if (df <= e.dtStart) cal.push(e);
					for (let t = next(e, e.dtStart); t && t.dtStart < dt; t = next(t, e.dtStart)) {
						if (df <= t.dtStart) cal.push(t);
					}
				}
				cal.sort((a, b) => a.dtStart.getTime() - b.dtStart.getTime()); //TODO Optimize?
				loading = false;
			});
	}

	function next(item: CallItem, orgBf: Date): CallItem | undefined {
		if (!item.rFreq) return;
		let df = new Date(item.dtStart);
		const edt = item.dtEnd ? new Date(item.dtEnd.getTime() - df.getTime()).getTime() : 0;
		switch (item.rFreq) {
			case 1:
				if (!item.rInterval) return;
				df = new Date(df.getTime() + item.rInterval * 24 * 60 * 60000); //Skip days
				break;
			case 2: //Week //TODO
				return;
			case 3:
				if (!item.rInterval)
					df.setMonth(df.getMonth() + 1, orgBf.getDate()); //Date of month
				else return; //Day of month (second friday, etc.)
				break;
			case 4:
				if (!item.rInterval) return;
				df.setFullYear(df.getFullYear() + item.rInterval, orgBf.getMonth(), orgBf.getDate()); //Skip years
				break;
			default:
				return;
		}
		//TODO rUntil
		return {
			...item,
			dtStart: df,
			dtEnd: new Date(df.getTime() + edt),
		};
	}

	function toStartOfDay(d: Date) {
		const o = new Date(d);
		o.setHours(0, 0, 0, 0);
		return o;
	}

	onMount(fetchData);
</script>

<Header title="Tod Calendar" />

{#each cal as item, i}
	<div>
		{#if i == 0 || cal[i - 1].dtStart < item.dtStart}
			<!-- TODO Better start of the day   -->
			<DateView date={toStartOfDay(item.dtStart)} />
		{/if}
	</div>
	<ListItem {item} />
{:else}
	{#if !loading}
		<div>No events found</div>
	{/if}
{/each}
<!-- else if content here -->

<Control>
	<a style="background-color: #333;" href="/tod/0">List</a>
</Control>

<style lang="postcss">
	div {
		text-align: center;
		margin-top: 1em;
		margin-bottom: 1em;
	}
</style>
