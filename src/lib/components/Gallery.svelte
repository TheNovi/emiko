<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import ImageDetail from './ImageDetail.svelte';

	const PAGE_LIMIT = 6;
	type Image = { id: number; favorite: boolean; public: boolean };

	let data: Image[] = $state([]);
	let loading = $state(false);
	let end = $state(false);
	let currentOffset = 0;
	let imageDetail: ReturnType<typeof ImageDetail>;

	let { pub }: { pub: boolean } = $props();

	export function reFetch() {
		currentOffset = 0;
		data = [];
		fetchImages();
		end = false;
	}

	//TODO Init data from load
	function fetchImages() {
		loading = true;
		// console.log('fetching', currentOffset);
		let q = new URL('/bob/f', page.url);
		if (pub) q.searchParams.append('public', 'true'); //This filters out private images if user IS logged in
		q.searchParams.append('offset', currentOffset + '');
		q.searchParams.append('limit', PAGE_LIMIT + '');
		fetch(q)
			.then((r) => r.json())
			.then((r: Image[]) => {
				currentOffset += r.length;
				if (r.length) data = [...data, ...r];
				else end = true;
				loading = false;
			});
	}

	async function showImageDetail(e: MouseEvent, id: number) {
		e.preventDefault();
		e.stopPropagation();
		// if (innerWidth < 640) return;
		if (imageDetail) imageDetail.openImageDetail(id);
	}

	onMount(() => {
		fetchImages();
	});
</script>

<svelte:window
	onscroll={(e) => {
		if (!loading && !end && window.innerHeight * 1.6 + window.scrollY >= document.body.offsetHeight)
			fetchImages();
		//FIXME This doesn't work if initial content doesn't alow scroll (all photos fit on screen)
	}}
/>

<ImageDetail {pub} bind:this={imageDetail} />

<div id="gallery">
	{#each data as item (item.id)}
		<button onclick={(e) => showImageDetail(e, item.id)}>
			<img src={`/bob/f/${item.id}${pub ? '?public=true' : ''}`} alt={item.id + ''} />
		</button>
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
		align-items: stretch;
		justify-items: stretch;
		overflow: hidden;
		max-width: 100vw;
		gap: 4px;
		margin: 5px;
	}
	#gallery button {
		aspect-ratio: 1;
		background-color: transparent;
		padding: 0;
		margin: 0;
		border: 0;
	}
	#gallery img {
		object-fit: cover;
		width: 100%;
		height: 100%;
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
