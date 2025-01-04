<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import DetailPage from '../../routes/(public)/bob/[id]/+page.svelte';

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
		let q = new URL('/bob/f', page.url);
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

	async function showImageDetail(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLAnchorElement;
		},
		id: number
	) {
		//TODO Mousewheel
		if (innerWidth < 640 || e.shiftKey || e.metaKey || e.ctrlKey) return;

		// prevent navigation
		e.preventDefault();

		const { href } = e.currentTarget;

		const result = await preloadData(href);

		if (result.type === 'loaded' && result.status === 200)
			pushState(href, { selected: result.data });
		else goto(href);
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

{#if page.state.selected}
	<!-- TODO Close on click outside -->
	<!-- TODO Disable scroll in gallery -->
	<div id="modal">
		<DetailPage close={() => history.back()} data={page.state.selected as any} />
	</div>
{/if}

<div id="gallery">
	{#each data as item (item.id)}
		<a href={'/bob/' + item.id} onclick={(e) => showImageDetail(e, item.id)}>
			<img src={`/bob/f/${item.id}${pub ? '?public=true' : ''}`} alt={item.id + ''} />
		</a>
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
	#gallery a {
		aspect-ratio: 1;
	}
	#gallery img {
		object-fit: cover;
		max-width: 100%;
		max-height: 100%;
		aspect-ratio: 1;
	}
	#gallery img:hover {
		object-fit: contain;
	}

	#modal {
		display: block;
		position: fixed;
		padding: 4px;
		background-color: gray;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		box-sizing: border-box;
	}

	#loading {
		margin: 10px;
		text-align: center;
	}
</style>
