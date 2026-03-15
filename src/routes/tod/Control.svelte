<script lang="ts">
	let { children } = $props();
</script>

<div id="control">
	{@render children?.()}
</div>

<style lang="postcss">
	#control {
		position: fixed;
		display: flex;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 3em;
		line-height: 3em;
	}
	#control :global(*) {
		background-color: #444;
		color: white;
		text-align: center;
		flex-grow: 1;
		border: 0;
		border-radius: 0.5em;
		/* Somehow this makes all buttons same size */
		aspect-ratio: 1;
	}
</style>
