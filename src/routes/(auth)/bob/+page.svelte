<script lang="ts">
	import Gallery from '$lib/components/Gallery.svelte';
	import Upload from './Upload.svelte';

	let gallery: ReturnType<typeof Gallery>;
</script>

<Upload onComplete={() => gallery.reFetch()} />

<Gallery pub={false} bind:this={gallery} />
