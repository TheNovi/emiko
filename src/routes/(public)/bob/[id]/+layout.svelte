<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<!-- {JSON.stringify(data)} -->
<div><a href={data.user ? '/bob' : '/pbob'}>To Gallery</a></div>
<div id="p">
	{@render children()}
</div>

<style lang="postcss">
	#p {
		left: 5%;
		margin: auto;
		/* Some padding and disables unwanted scrolls */
		/* TODO Test scrolls on mobile */
		width: 95vw;
		height: 85vh;
	}
</style>
