<script lang="ts">
	import type { PageData } from './$types';

	let { data, close }: { data: PageData; close?: () => any } = $props();
</script>

{#if data.f}
	<img src={'/bob/f/' + data.f.id} alt={data.f.id + ''} />
	{#if close}
		<br />
		<button type="button" onclick={() => close()}>Close</button>
	{/if}
{:else}
	<div>File not found</div>
{/if}

<style lang="postcss">
	img {
		object-fit: contain;
	}
</style>
