<script lang="ts">
	import DateView from "$lib/components/DateView.svelte";

	type TItem = { id: number; title: string; state: number; dtStart: Date | null; dtEnd: Date | null };
	let { item }: { item: TItem } = $props();

	// TODO 2 Better states (return from server)
	let states = ["Done", "Open", "In Process"];
</script>

<!-- TODO 10 Internet says its not good idea to have other clickable items inside <a>. So either make only title part link. Or inspire from how reddit has done it -->
<!-- TODO 0 Quick change state -->
<!-- TODO 5 event rFreq + rInterval -->
<!-- TODO 5 event rUntil -->
<a class="item" href={`/tod/${item.id}`}>
	<span>{item.title}</span>
	<span>{states[item.state]}</span>
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
