<script lang="ts">
	import { formParseInputDate } from "$lib/util";
	import type { HTMLInputAttributes } from "svelte/elements";

	let { name, value = $bindable(), ...opts }: { name: string; value: Date | null } & HTMLInputAttributes = $props();
</script>

<!-- TODO Split date and time? -->
<input
	type="datetime-local"
	{name}
	id={name}
	bind:value={
		() => formParseInputDate(value),
		(v) => {
			value = v ? new Date(v) : null;
		}
	}
	{...opts}
/>
