<script lang="ts">
	import { enhance } from "$app/forms";
	import { formParseInputDate, formDatesToISO } from "$lib/util";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	let path = $derived(data.tod.id ? [{ id: 0, title: "Tod" }, ...data.tod.parents].slice(0, -1) : [{ id: 0, title: "Tod" }, ...data.tod.parents]); //Include "self" in "new" mode
	let tod = $derived(data.tod);

	//Makes variables inside tod bindable (for dates)
	// let tod = $derived.by(() => {
	// 	let ret = $state(data.tod);
	// 	return ret;
	// });
	// $inspect(tod);
</script>

<div id="header">
	<span>
		{#each path as p, i}
			<a href={`/tod/${p.id}`}>{i > 0 ? " / " : ""}{p.title}</a>
		{:else}
			<span>&nbsp;</span>
		{/each}
	</span>
	<h1>{tod.title}</h1>
</div>
<form
	method="post"
	use:enhance={({ formData }) => {
		formDatesToISO(formData, ["dateFrom", "dateTo"]);
		//TODO Send only changed (mainly description)
		// console.log(formData.get("dateFrom"));
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
>
	{#each form?.errors || [] as e (e)}
		<div class="error">{e}</div>
	{/each}
	<input type="hidden" name="id" id="id" value={tod.id} />
	<input type="hidden" name="parentId" id="parentId" value={tod.parentId} />
	<div>
		<label for="title">title</label>
		<input type="text" name="title" id="title" required maxlength="250" value={tod.title} />
	</div>
	<div>
		<label for="state">state</label>
		<!-- <input type="number" name="state" id="state" required max="100" value={tod.state} /> -->
		<select name="state" id="state" required value={"" + tod.state}>
			<option value="1">Open</option>
			<option value="2">In Process</option>
			<option value="0">Done</option>
		</select>
	</div>
	<div>
		<label for="dateFrom">from</label>
		<!-- <DateTime name="dateFrom" bind:value={tod.dateFrom} /> -->
		<input type="datetime-local" name="dateFrom" id="dateFrom" value={formParseInputDate(tod.dateFrom)} />
	</div>
	<div>
		<label for="dateTo">To</label>
		<!-- <DateTime name="dateTo" bind:value={tod.dateTo} /> -->
		<input type="datetime-local" name="dateTo" id="dateTo" value={formParseInputDate(tod.dateTo)} />
	</div>
	<div>
		<label for="dateCopyOffset">Event copy date offset in days</label>
		<input type="number" min="0" name="dateCopyOffset" id="dateCopyOffset" value={tod.dateCopyOffset ? tod.dateCopyOffset / (24 * 3600 * 1000) : null} />
	</div>
	<div>
		<label for="description">description</label>
		<textarea name="description" id="description" maxlength="2500" value={tod.description}></textarea>
	</div>

	<div id="control">
		<a style="background-color: red;" href={`/tod/${tod.id ? tod.id : tod.parentId}`}>Exit</a>
		<button style="background-color: green;" type="submit">Save</button>
	</div>
</form>

<style lang="postcss">
	#header {
		background-color: #222;
		text-align: center;
		border-radius: 1em;
		padding: 0.5em;
		margin: 1em 0em 0.7em 0em;
	}

	#control {
		position: fixed;
		display: flex;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 3em;
		line-height: 3em;
	}
	#control button,
	#control a {
		background-color: #222;
		border: none;
		text-align: center;
		flex-grow: 1;
		border-radius: 0.5em;
		/* Somehow this makes all buttons same size */
		aspect-ratio: 1;
	}
</style>
