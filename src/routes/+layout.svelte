<script lang="ts">
	import "../app.pcss"; //TODO Test postcss
	import { browser } from "$app/environment";
	import { Settings } from "luxon";
	import type { Snippet } from "svelte";
	import type { LayoutData } from "./$types";

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	if (browser) Settings.defaultZone = data.user?.tz || ""; //Lets pray this works
</script>

{#if data.user}
	<header>
		<a href="/">Emiko</a>
		<a href="/p">{data.user.name}</a>
	</header>
{/if}
<main>
	{@render children()}
</main>

<style lang="postcss">
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #222;
		top: 0;
		width: 100%;
		height: 1.5rem;
	}
	header a {
		display: inline-block;
		padding-top: 2px;
		padding-left: 8px;
		padding-right: 8px;
	}
</style>
