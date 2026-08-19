<script lang="ts">
	import { page } from "$app/state";
	import type { SearchItem } from "$lib/server/tod";

	let { onSearch, input = false }: { onSearch?: (item: SearchItem) => void; input?: boolean } = $props();
	let value: string = $state("");
	let results: SearchItem[] = $state([]);

	let debounceId: NodeJS.Timeout;
	function debounce() {
		if (debounceId) clearTimeout(debounceId);
		debounceId = setTimeout(() => find(), 200);
	}

	async function find() {
		// console.log("find " + value);
		results = [];
		if (!value) return;

		//TODO Remote function
		const url = new URL("/tod/search", page.url);
		url.searchParams.append("v", value);
		// console.log(url.toString());
		const res = await fetch(url);
		if (!res.ok) {
			console.error("Search error", res.text);
			return;
		}
		results = await res.json();
	}

	function clear() {
		if (debounceId) clearTimeout(debounceId);
		results = [];
		value = "";
	}

	function selectResult(item: SearchItem) {
		if (onSearch) onSearch(item);
	}
</script>

{#snippet result()}
	<ul>
		{#each results as item}
			<li>
				{#if onSearch}
					<button onclick={() => selectResult(item)} command="close" commandfor="modalSearch">{item.title}</button>
				{:else}
					<a href={`/tod/${item.id}`} onclick={clear}>{item.title}</a>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

{#snippet searchInput()}
	<input id="searchInput" type="text" bind:value oninput={debounce} autocomplete="off" />
{/snippet}

{#snippet sButton()}
	<button command="show-modal" commandfor="modalSearch">Search</button>

	<dialog id="modalSearch" onclose={clear} closedby="any">
		{@render searchInput()}
		{@render result()}
	</dialog>
{/snippet}

{#snippet sInput()}
	{@render searchInput()}
	<div id="floating">
		{@render result()}
	</div>
{/snippet}

{#if input}
	{@render sInput()}
{:else}
	{@render sButton()}
{/if}

<style lang="postcss">
	/* Common */
	#searchInput {
		border: 0;
		display: block;
		width: 98vw;
		margin: auto;
		height: 3vh;
		font-size: 2vh;
		background-color: #333;
		color: white;
		margin-bottom: 1vh;
	}

	/* Button */
	dialog {
		overflow-x: hidden;
		overflow-y: auto;
		max-height: 70vh;
	}

	dialog #searchInput {
		width: 100%;
	}

	/* Input */
	#searchInput {
		margin-top: 1vh;
	}
	#floating {
		z-index: 1;
		background-color: black;
		width: 100%;
		position: absolute;
		overflow-x: hidden;
		overflow-y: auto;
		max-height: 70vh;
	}

	/* Result */
	li button,
	li a {
		display: block;
		width: 100%;
		margin: auto;
		padding: 1vh;
		background-color: #222;
		margin-bottom: 1vh;
		text-align: center;
		border-radius: 25px;
	}
</style>
