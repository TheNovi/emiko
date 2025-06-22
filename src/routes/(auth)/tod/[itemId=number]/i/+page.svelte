<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<h1>{data.item.title}</h1>
{JSON.stringify(data.item)}
