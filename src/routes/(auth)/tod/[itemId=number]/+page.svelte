<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	let cI = $derived(data.tod.parents.length ? data.tod.parents[data.tod.parents.length - 1] : { id: 0, title: "Tod" });
	let lastP = $derived(data.tod.parents.length > 1 ? data.tod.parents[data.tod.parents.length - 2].id : 0);

	// $inspect(data.tod);
</script>

{#if cI.id}
	<Header title={`Tod | ${cI.title}`} />
{:else}
	<Header title="Tod" />
{/if}
<div id="header">
	<span>
		{#each [{ id: 0, title: "Tod" }, ...data.tod.parents].slice(0, -1) as p, i}
			<a href={`/tod/${p.id}`}>{i > 0 ? " / " : ""}{p.title}</a>
		{:else}
			<span>&nbsp;</span>
		{/each}
	</span>
	<h1>{cI.title}</h1>
</div>
{#each data.tod.items as i}
	<!-- {#each [...Array(100).keys()].map((v) => ({ id: v, title: "false " + v })) as i} -->
	<a class="item" href={`/tod/${i.id}`}>{i.title}</a>
	<!-- TODO 0 Quick change state -->
{/each}
<div id="control">
	<a style="background-color: red;" href={`/tod/${lastP}`}>Back</a>
	<a style="background-color: blue;" href={`/tod/${cI.id}/n`}>Add</a>
	{#if cI.id}
		<a style="background-color: green;" href={`/tod/${cI.id}/e`}>Open</a>
	{/if}
</div>

<style lang="postcss">
	#header {
		background-color: #222;
		text-align: center;
		border-radius: 1em;
		padding: 0.5em;
		margin: 1em 0em 0.7em 0em;
	}

	.item {
		display: block;
		background-color: #222;
		text-align: center;
		border-radius: 0.5em;
		padding: 0.5em;
		margin-bottom: 0.5em;
	}

	#control {
		position: fixed;
		/* TODO 2 Remove grid */
		display: flex;
		/* gap: 10%; */
		left: 0;
		bottom: 1px;
		width: 100%;
	}
	#control a {
		background-color: #222;
		text-align: center;
		flex-grow: 1;
		/* aspect-ratio: 1; */
		height: 3em;
		line-height: 3em;
		border-radius: 0.5em;
	}
</style>
