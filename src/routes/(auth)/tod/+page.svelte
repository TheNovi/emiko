<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import type { PageProps } from "./$types";
	import Control from "./Control.svelte";
	import ListItem from "./ListItem.svelte";

	type CallItem = (typeof data.cal)[0];

	let { data }: PageProps = $props();
	let cal = $derived.by(() => {
		const o: CallItem[] = [];
		//Repeat all
		for (const e of data.cal) {
			if (data.from <= e.dateFrom) o.push(e);
			for (let t = next(e, e.dateFrom); t && t.dateFrom < data.to; t = next(t, e.dateFrom)) {
				if (data.from <= t.dateFrom) o.push(t);
			}
		}
		return o.sort((a, b) => a.dateFrom.getTime() - b.dateFrom.getTime()); //TODO Optimize?
	});

	function next(item: CallItem, orgBf: Date): CallItem | undefined {
		if (!item.dateCopyMode) return;
		let df = new Date(item.dateFrom);
		switch (item.dateCopyMode) {
			case 1:
				if (!item.dateCopyOffset) return;
				df = new Date(df.getTime() + item.dateCopyOffset * 24 * 60 * 60000); //Skip days
				break;
			case 2:
				if (item.dateCopyOffset == null) return;
				if (item.dateCopyOffset == 0)
					df.setMonth(df.getMonth() + 1, orgBf.getDate()); //Date of month
				else return; //Day of month (second friday, etc.)
				break;
			case 3:
				if (!item.dateCopyOffset) return;
				df.setFullYear(df.getFullYear() + item.dateCopyOffset, orgBf.getMonth(), orgBf.getDate()); //Skip years
				break;
			default:
				return;
		}
		return {
			...item,
			dateFrom: df,
		};
	}
</script>

<Header title="Tod Calendar" />

{#each cal || [] as item, i}
	<div>
		{#if i == 0 || cal[i - 1].dateFrom < item.dateFrom}
			{item.dateFrom.toDateString()}
			{#if item.dateFrom.getHours() || item.dateFrom.getMinutes()}
				{item.dateFrom.toLocaleTimeString()}
			{/if}
		{/if}
	</div>
	<ListItem {item} isDate />
{/each}

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
