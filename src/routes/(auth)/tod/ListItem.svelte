<script lang="ts">
	import DateView from "$lib/components/DateView.svelte";

	type TItem = { id: number; title: string; state: number; dtStart: Date | null; dtEnd: Date | null };
	let { item }: { item: TItem } = $props();
</script>

<!-- TODO 0 Quick change state -->
<!-- TODO 5 Better states (return from server) -->
<!-- TODO 5 event rFreq + rInterval -->
<!-- TODO 5 event rUntil -->
<a class="item" href={`/tod/${item.id}`}>
	<span>{item.title}</span>
	<span>{item.state}</span>
	<span>
		{#if item.dtStart}
			<DateView date={item.dtStart} />
			{#if item.dtEnd}
				- <DateView date={item.dtStart} />
			{/if}
		{/if}
	</span>
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
</style>
