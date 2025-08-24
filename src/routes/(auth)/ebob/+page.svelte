<script lang="ts">
	import Gallery from "$lib/components/Gallery.svelte";
	import Title from "$lib/components/Title.svelte";
	import Upload from "./Upload.svelte";

	let gallery: ReturnType<typeof Gallery>;
</script>

<Title title="EBob" />
<Upload onComplete={() => gallery.reFetch()} />
<Gallery pub={false} bind:this={gallery} />
