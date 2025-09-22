<script lang="ts">
	import DateView from "$lib/components/DateView.svelte";

	type TItem = { id: number; title: string; state: number; dtStart: Date | null; dtEnd: Date | null };
	let { item }: { item: TItem } = $props();
</script>

<!-- TODO 10 Internet says its not good idea to have other clickable items inside <a>. So either make only title part link. Or inspire from how reddit has done it -->
<!-- TODO 5 event rFreq + rInterval + rUntil -->
<a href={`/tod/${item.id}`} class={["item", ["done", "open", "process"][item.state]]}>
	<span>{item.title}</span>
	<span>
		{#if item.dtStart}
			<DateView date={item.dtStart} />
			{#if item.dtEnd}
				- <DateView date={item.dtEnd} />
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
