<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	let lastP = $derived(data.tod.parents.length ? data.tod.parents[data.tod.parents.length - 1] : { id: 0, title: "Tod" });

	// $inspect(data.tod.parents);
</script>

{#if lastP.title}
	<Header title={`Tod | ${lastP.title}`} />
{:else}
	<Header title="Tod" />
{/if}
<span>
	{#each [{ id: 0, title: "Tod" }, ...data.tod.parents].slice(0, -1) as p}
		<a href={`/tod/${p.id}`}>/{p.title}</a>
	{/each}
</span>
<h1>{lastP.title}</h1>
{#each data.tod.items as i}
	<div>
		<a href={`/tod/${i.id}`}> {i.title}</a>
		<!-- {#if i.children}
			<a href={`/tod/${i.id}`}>expand</a>
		{/if} -->
		<a href={`/tod/${i.id}/i`}>open</a>
	</div>
{/each}
