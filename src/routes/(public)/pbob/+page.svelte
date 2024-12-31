<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h1>Bob public</h1>
<div>{JSON.stringify(data)}</div>
