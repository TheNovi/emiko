<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import type { PageProps } from "./$types";
	import Control from "./Control.svelte";
	import ListItem from "./ListItem.svelte";

	let { data }: PageProps = $props();
</script>

<Header title="Tod Calendar" />

{#each data.cal as item, i}
	{#if item.dateFrom}
		<div>
			{#if i == 0 || (data.cal[i].dateFrom && data.cal[i].dateFrom < item.dateFrom)}
				{item.dateFrom.toLocaleDateString()}
				{#if item.dateFrom.getHours() || item.dateFrom.getMinutes()}
					{item.dateFrom.toLocaleTimeString()}
				{/if}
			{/if}
		</div>
		<ListItem {item} isDate />
	{/if}
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
