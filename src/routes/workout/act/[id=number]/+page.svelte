<script lang="ts">
	import { enhance } from "$app/forms";
	import FormInput from "$lib/components/FormInput.svelte";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	// //Reactive values (for bindings)
	let act = $derived.by(() => {
		let v = $state(data.act);
		return v;
	});
</script>

<h2>{act.mName}</h2>
<form
	method="post"
	use:enhance={({ formData }) => {
		// deleteConfirm = false;
		// formDatesToISO(formData, ["dtStart", "dtEnd", "rUntil"]);
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
>
	{#each form?.errors || [] as e (e)}
		<div class="error">{e}</div>
	{/each}
	<FormInput type="hidden" name="id" value={act.id} />
	<FormInput name="reps" type="number" bind:value={act.reps} min="0" />
	<FormInput name="sets" type="number" bind:value={act.sets} min="0" />
	<FormInput name="value" type="number" value={act.value} step="0.1" min="0" />
	<!-- TODO {act.mUnit} -->
	<div>{act.mText}</div>
	<button formaction="?/save" type="submit" style="background-color: green;">Save</button>
	<!-- TODO Delete confirm -->
	<button formaction="?/delete" type="submit" style="background-color: red;">Delete</button>
	<a href="/workout">Exit</a>
</form>
