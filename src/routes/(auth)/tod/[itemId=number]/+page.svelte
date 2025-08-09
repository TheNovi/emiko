<script lang="ts">
	import { enhance } from "$app/forms";
	import Header from "$lib/components/Header.svelte";
	import { formDatesToISO, formParseInputDate } from "$lib/util";
	import Control from "../Control.svelte";
	import ListItem from "../ListItem.svelte";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	let tod = $derived(data.tod);
	//TODO Don't reverse, loop backwards
	//TODO Remove parent Tod from Root
	let parents = $derived([...tod.parents, { id: 0, title: "Tod" }].reverse());
	let lastP = $derived(tod.parents.length ? tod.parents[0].id : 0);

	// $inspect(tod.parents);
</script>

{#if tod.id}
	<Header title={`Tod | ${tod.title}`} />
{:else}
	<Header title="Tod" />
{/if}
<div id="header">
	<span>
		{#each parents as p, i}
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
	{#if tod.id}
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
			<input type="datetime-local" name="dateFrom" id="dateFrom" value={formParseInputDate(tod.dateFrom)} />
		</div>
		<div>
			<label for="dateTo">To</label>
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
	{/if}
	<Control>
		<a style="background-color: red;" href={`/tod/${lastP}`}>Parent</a>
		<a style="background-color: #333;" href="/tod">Calendar</a>
		<button formaction="?/add" type="submit" style="background-color: blue;">Add</button>
		<button formaction="?/save" disabled={!tod.id} type="submit" style="background-color: green;">Save</button>
	</Control>
</form>
{#each data.tod.items as item}
	<!-- {#each [...Array(100).keys()].map((v) => ({ id: v, title: "false " + v })) as i} -->
	<ListItem {item} isDate={false} />
{/each}

<style lang="postcss">
	#header {
		background-color: #222;
		text-align: center;
		border-radius: 1em;
		padding: 0.5em;
		margin: 1em 0em 0.7em 0em;
	}
</style>
