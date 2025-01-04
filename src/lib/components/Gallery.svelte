<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	const PAGE_LIMIT = 6;
	type Image = { id: number; favorite: boolean; public: boolean };

	let data: Image[] = $state([]);
	let loading = $state(false);
	let end = $state(false);
	let currentOffset = 0;

	let { pub = false }: { pub?: boolean } = $props();

	export function reFetch() {
		fetchImages();
	}

	//TODO Init data from load
	function fetchImages() {
		loading = true;
		// console.log('fetching', currentOffset);
		let q = new URL('/bob/p', page.url);
		if (pub) q.searchParams.append('public', 'true'); //This filters out private images if user IS logged in
		q.searchParams.append('offset', currentOffset + '');
		q.searchParams.append('limit', PAGE_LIMIT + '');
		currentOffset += PAGE_LIMIT;
		fetch(q)
			.then((r) => r.json())
			.then((r: Image[]) => {
				if (r.length) data = [...data, ...r];
				else end = true;
				loading = false;
			});
	}

	onMount(() => {
		fetchImages();
	});
</script>

<svelte:window
	onscroll={() => {
		if (!loading && !end && window.innerHeight * 1.6 + window.scrollY >= document.body.offsetHeight)
			fetchImages();
		//FIXME This doesn't work if initial content doesn't alow scroll (all photos fit on screen)
	}}
/>

<div id="gallery">
	{#each data as item (item.id)}
		<img src={`/bob/p/${item.id}${pub ? '?public=true' : ''}`} alt={item.id + ''} />
	{:else}
		{#if !loading}
			<div>Empty</div>
		{/if}
	{/each}
</div>

{#if loading}
	<!-- TODO Animation -->
	<div id="loading">Loading...</div>
{/if}

<style lang="postcss">
	#gallery {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		max-width: 100vw;
		align-items: stretch;
		justify-items: stretch;
		gap: 4px;
		margin: 5px;
	}
	#gallery img {
		/* object-fit: contain; */
		object-fit: cover;
		max-width: 100%;
		aspect-ratio: 1;
	}
	#gallery img:hover {
		object-fit: contain;
	}
	#loading {
		margin: 10px;
		text-align: center;
	}
</style>
