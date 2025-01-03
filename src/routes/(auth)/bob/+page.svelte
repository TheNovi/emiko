<script lang="ts">
	import Gallery from '$lib/components/Gallery.svelte';
	import Upload from './Upload.svelte';

	let gallery: ReturnType<typeof Gallery>;
</script>

<Upload onComplete={() => gallery.reFetch()} />

<!-- <div>{JSON.stringify(data)}</div> -->
<Gallery bind:this={gallery} />
