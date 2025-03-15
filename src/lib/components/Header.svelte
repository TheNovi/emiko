<script lang="ts">
	import { page } from '$app/state';

	let { title }: { title: string } = $props();
	//TODO Do this using Context?
</script>

<svelte:head>
	{#if !title}
		{#if page.data.user}
			<title>Emiko</title>
		{:else}
			<title>TheNovi</title>
		{/if}
	{:else if page.data.user}
		<title>Emiko | {title}</title>
	{:else}
		<title>TheNovi | {title}</title>
	{/if}
</svelte:head>
