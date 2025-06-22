<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	$inspect(data.tod);
</script>

{#if data.tod.parent.title}
	<Header title={`Tod | ${data.tod.parent.title}`} />
{:else}
	<Header title="Tod" />
{/if}
<h1>/{data.tod.parent.title}</h1>
<!-- TODO 9 Path (make parent as array) -->
{#each data.tod.items as i}
	<div>
		{i.title}
		{#if i.children}
			<a href={`/tod/${i.id}`}>expand</a>
		{/if}
		<a href={`/tod/${i.id}/i`}>open</a>
	</div>
{/each}
