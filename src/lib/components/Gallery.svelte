<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	const PAGE_LIMIT = 6;
	type Image = { id: number; favorite: boolean; public: boolean };

	let data: Image[] = $state([]);

	let { pub = false }: { pub?: boolean } = $props();

	export function reFetch() {
		fetchImages();
	}

	//TODO Init data from load
	function fetchImages(offset = 0) {
		console.log('fetching');
		let q = new URL('/bob/p', page.url);
		if (pub) q.searchParams.append('public', 'true');
		q.searchParams.append('offset', offset + '');
		q.searchParams.append('limit', PAGE_LIMIT + '');
		fetch(q)
			.then((r) => r.json())
			.then((r: Image[]) => {
				data = [...data, ...r];
			});
	}

	onMount(() => {
		fetchImages();
	});
</script>

<svelte:window
	onscroll={() => {
		if (window.innerHeight * 1.6 + window.scrollY >= document.body.offsetHeight)
			fetchImages(data.length);
		//TODO Stop fetching when at end
		//FIXME This doesn't work if initial content doesn't alow scroll (all photos fit on screen)
	}}
/>

<div id="gallery">
	{#each data as item (item.id)}
		<img src={`/bob/p/${item.id}${pub ? '?public=true' : ''}`} alt={item.id + ''} />
	{:else}
		<div>Empty</div>
	{/each}
</div>

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
</style>
