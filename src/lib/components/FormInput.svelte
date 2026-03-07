<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";

	type P = { name: string } & Omit<HTMLInputAttributes, "value"> &
		({ type: "hidden"; value: string | number } | { type: "text"; value: string } | { type: "number"; value: number });
	let { type, name, value = $bindable(), ...rest }: P = $props();
</script>

{#if type == "hidden"}
	<input type="hidden" {name} id={rest.id || name} bind:value {...rest} />
{:else}
	<div>
		<label for={name}>{name}</label>
		<input {type} {name} id={rest.id || name} bind:value {...rest} />
	</div>
{/if}

<style lang="postcss">
	label {
		text-transform: capitalize;
	}
</style>
