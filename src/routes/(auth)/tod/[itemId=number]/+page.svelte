<script lang="ts">
	import { enhance } from "$app/forms";
	import InputDate from "$lib/components/InputDate.svelte";
	import Title from "$lib/components/Title.svelte";
	import type { CallItem } from "$lib/server/todCal";
	import { todIsTask, todTaskComplete } from "$lib/todUtil";
	import { formDatesToISO } from "$lib/util";
	import Control from "../Control.svelte";
	import ListItem from "../ListItem.svelte";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	//Reactive values (for bindings)
	let tod = $derived.by(() => {
		let v = $state(data.tod);
		return v;
	});
	let parents = $derived(tod.id ? [...tod.parents, { id: 0, title: "Tod" }].reverse() : []);
	let lastP = $derived(tod.parents.length ? tod.parents[0].id : 0);
	let deleteConfirm = $state(false);

	$effect(() => {
		// console.log("effect");
		if (deleteConfirm) setTimeout(() => (deleteConfirm = false), 2000);
	});

	// $inspect(tod.parents);
</script>

{#if tod.id}
	<Title title={`Tod | ${tod.title}`} />
{:else}
	<Title title="Tod" />
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
		deleteConfirm = false;
		formDatesToISO(formData, ["dtStart", "dtEnd", "rUntil"]);
		//TODO Send only changed (mainly description)
		// console.log(formData.get("dtStart"));
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
			<select name="state" id="state" required bind:value={tod.state}>
				<option value={1}>Open</option>
				<option value={2}>In Process</option>
				<option value={0}>Done</option>
			</select>
		</div>
		<div>
			<label for="dtStart">from</label>
			<InputDate name="dtStart" bind:value={tod.dtStart} />
		</div>
		<div>
			<label for="dtEnd">To</label>
			<InputDate name="dtEnd" disabled={!tod.dtStart} value={tod.dtEnd} />
		</div>
		<div>
			<label for="eventType">Event Type</label>
			<select name="eventType" disabled={!tod.dtStart} bind:value={tod.eventType}>
				<option value={0}>Event</option>
				<option value={1}>Task repeat from completion</option>
				<option value={2}>Task repeat from own date</option>
			</select>
		</div>
		<div>
			<label for="rFreq">Repeats</label>
			<select name="rFreq" disabled={!tod.dtStart} bind:value={tod.rFreq}>
				<option value={null}></option>
				<option value={1}>Daily</option>
				<option value={2} disabled>Weekly</option>
				<option value={3}>Monthly</option>
				<option value={4}>Yearly</option>
			</select>
		</div>

		{#if tod.rFreq == 1 || tod.rFreq == 4}
			<!-- Daily, Yearly -->
			<div>
				<label for="rInterval">Interval</label>
				<input type="number" min="0" name="rInterval" id="rInterval" disabled={!tod.dtStart} value={tod.rInterval} />
			</div>
		{:else}
			<div>
				<label for="rInterval">Interval</label>
				<input type="number" min="0" name="rInterval" id="rInterval" disabled />
			</div>
		{/if}
		<div>
			<label for="rUntil">Until</label>
			<InputDate name="rUntil" disabled={!tod.dtStart || !tod.rFreq} value={tod.rUntil} />
		</div>
		<div>
			<label for="description">description</label>
			<textarea name="description" id="description" maxlength="2500" value={tod.description}></textarea>
		</div>
		{#if todIsTask(tod)}
			<button
				type="button"
				onclick={() => {
					todTaskComplete(tod as CallItem);
				}}>Task Complete</button
			>
		{/if}
	{/if}
	<Control>
		<a href="/tod" style="background-color: maroon;">Calendar</a>
		<a href={`/tod/${lastP}`} style="background-color: blueviolet;">Parent</a>
		<button formaction="?/save" disabled={!tod.id} type="submit" style="background-color: green;">Save</button>
		<button formaction="?/add" type="submit" style="background-color: blue;">Add</button>
		<button disabled={!tod.id} class:hidden={deleteConfirm} type="button" onclick={() => (deleteConfirm = true)} style="background-color: red;">Delete</button>
		<button formaction="?/delete" disabled={!tod.id} class:hidden={!deleteConfirm} type="submit" style="background-color: red;">You sure?</button>
	</Control>
</form>
<ul>
	<!-- {#each [...Array(100).keys()].map((v) => ({ id: v, title: "false " + v })) as i} -->
	{#each data.tod.items as item}
		<li>
			<ListItem {item} />
		</li>
	{/each}
</ul>

<style lang="postcss">
	#header {
		background-color: #222;
		text-align: center;
		border-radius: 1em;
		padding: 0.5em;
		margin: 1em 0em 0.7em 0em;
	}
	ul {
		text-decoration: none;
		/* Control height */
		padding-bottom: 3em;
	}

	.hidden {
		display: none;
	}
</style>
