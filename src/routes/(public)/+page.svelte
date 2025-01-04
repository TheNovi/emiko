<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

{#if data.user}
	<h1>Welcome to Emiko, {data.user.name}</h1>
	<a href="/bob">Bob</a>
{:else}
	<h1>Welcome to TheNovi.cz</h1>
{/if}
<a href="/pbob">PBob</a>
