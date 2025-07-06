<script lang="ts">
	import { goto } from "$app/navigation";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	let path = $derived(data.tod.id ? [{ id: 0, title: "Tod" }, ...data.tod.parents].slice(0, -1) : [{ id: 0, title: "Tod" }, ...data.tod.parents]); //Include "self" in "new" mode

	function save() {
		console.log("Saving: ", data.tod);
	}

	// $inspect(data.tod);
</script>

<!-- TODO 1 Path? -->
<!-- TODO 5 Form -->
<div id="header">
	<span>
		{#each path as p, i}
			<a href={`/tod/${p.id}`}>{i > 0 ? " / " : ""}{p.title}</a>
		{:else}
			<span>&nbsp;</span>
		{/each}
	</span>
	<h1>{data.tod.title}</h1>
</div>
<div id="desc">{data.tod.description}</div>
<div id="control">
	<button style="background-color: red;" onclick={() => goto(`/tod/${data.tod.id ? data.tod.id : data.tod.parentId}`)}>Exit</button>
	<button style="background-color: green;" onclick={save}>Save</button>
</div>

<div style="overflow-x: auto;">
	{JSON.stringify(data.tod)}
</div>

<style lang="postcss">
	#header {
		background-color: #222;
		text-align: center;
		border-radius: 1em;
		padding: 0.5em;
		margin: 1em 0em 0.7em 0em;
	}

	#desc {
		display: block;
		background-color: #222;
		text-align: center;
		border-radius: 0.5em;
		padding: 0.5em;
		margin-bottom: 0.5em;
		overflow: auto;
	}

	#control {
		position: fixed;
		display: grid;
		grid-template-columns: 1fr 1fr;
		/* gap: 10%; */
		left: 0;
		bottom: 0;
		width: 100%;
	}
	#control button {
		background-color: #222;
		border: none;
		text-align: center;
		height: 3em;
		border-radius: 0.5em;
	}
</style>
