<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div id="header">{data.user.name}</div>
{@render children()}

<style lang="postcss">
	#header {
		background-color: #222;
		text-align: right;
		padding-right: 10px;
		padding-top: 2px;
		padding-bottom: 2px;
		margin-bottom: 5px;
	}
</style>
