<script lang="ts">
	type TItem = { id: number; title: string; state: number; dtStart: Date | null; dtEnd: Date | null };
	let { item }: { item: TItem } = $props();
</script>

<!-- TODO 0 Quick change state -->
<!-- TODO Cal -->
<a class="item" href={`/tod/${item.id}`}>{item.title}</a>

<style lang="postcss">
	.item {
		display: block;
		background-color: #222;
		text-align: center;
		border-radius: 0.5em;
		padding: 0.5em;
		margin-bottom: 0.5em;
	}
</style>
