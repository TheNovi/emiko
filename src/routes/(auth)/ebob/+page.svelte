<script lang="ts">
	import Gallery from "$lib/components/Gallery.svelte";
	import Header from "$lib/components/Header.svelte";
	import Upload from "./Upload.svelte";

	let gallery: ReturnType<typeof Gallery>;
</script>

<Header title="EBob" />
<Upload onComplete={() => gallery.reFetch()} />
<Gallery pub={false} bind:this={gallery} />
