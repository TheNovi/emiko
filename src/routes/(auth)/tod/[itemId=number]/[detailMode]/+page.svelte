<script lang="ts">
	import DateTime from "$lib/components/DateTime.svelte";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	let path = $derived(data.tod.id ? [{ id: 0, title: "Tod" }, ...data.tod.parents].slice(0, -1) : [{ id: 0, title: "Tod" }, ...data.tod.parents]); //Include "self" in "new" mode

	// $inspect(data.tod);
</script>

<div id="header">
	<span>
		{#each path as p, i}
			<a href={`/tod/${p.id}`}>{i > 0 ? " / " : ""}{p.title}</a>
		{:else}
			<span>&nbsp;</span>
		{/each}
	</span>
	<h1>{data.tod.title}</h1>
</div>
<!-- TODO Send only changed -->
<form method="post">
	{#each form?.errors || [] as e (e)}
		<div class="error">{e}</div>
	{/each}
	<input type="hidden" name="id" id="id" value={data.tod.id} />
	<input type="hidden" name="parentId" id="parentId" value={data.tod.parentId} />
	<input type="hidden" name="timezoneOffset" id="timezoneOffset" value={new Date().getTimezoneOffset()} />
	<div>
		<label for="title">title</label>
		<input type="text" name="title" id="title" required maxlength="250" value={data.tod.title} />
	</div>
	<div>
		<label for="state">state</label>
		<!-- <input type="number" name="state" id="state" required max="100" value={data.tod.state} /> -->
		<select name="state" id="state" required value={"" + data.tod.state}>
			<option value="1">Open</option>
			<option value="2">In Process</option>
			<option value="0">Done</option>
		</select>
	</div>
	<div>
		<label for="dateFrom">from</label>
		<DateTime name="dateFrom" value={data.tod.dateFrom} />
	</div>
	<div>
		<label for="dateTo">To</label>
		<DateTime name="dateTo" value={data.tod.dateTo} />
	</div>
	<div>
		<label for="dateCopyOffset">Event copy date offset in days</label>
		<input type="number" min="0" name="dateCopyOffset" id="dateCopyOffset" value={data.tod.dateCopyOffset} />
	</div>
	<div>
		<label for="description">description</label>
		<textarea name="description" id="description" maxlength="2500" value={data.tod.description}></textarea>
	</div>

	<div id="control">
		<a style="background-color: red;" href={`/tod/${data.tod.id ? data.tod.id : data.tod.parentId}`}>Exit</a>
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
