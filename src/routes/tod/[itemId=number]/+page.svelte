<script lang="ts">
	import { enhance } from "$app/forms";
	import FormInput from "$lib/components/FormInput.svelte";
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
		formDatesToISO(formData, ["dtStart", "dtEnd", "rUntil"]); //TODO Should not be needed (tz is saved in local.user.tz)
		//TODO Try to not to send description every time (others doesn't matter too much)
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
		<FormInput type="hidden" name="id" value={tod.id} />
		<FormInput type="hidden" name="parentId" value={tod.parentId} />
		<FormInput name="title" value={tod.title} type="text" required maxlength={25} />
		<FormInput name="state" value={tod.state} type="select" required>
			<option value={1}>Open</option>
			<option value={2}>In Process</option>
			<option value={0}>Done</option>
		</FormInput>
		<FormInput label="from" name="dtStart" bind:value={tod.dtStart} type="datetime" />
		<FormInput label="to" name="dtEnd" value={tod.dtEnd} type="datetime" disabled={!tod.dtStart} />
		<FormInput label="Event Type" name="eventType" bind:value={tod.eventType} type="select" disabled={!tod.dtStart}>
			<option value={0}>Event</option>
			<option value={1}>Task repeat from completion</option>
			<option value={2}>Task repeat from own date</option>
		</FormInput>
		<FormInput label="Repeats" name="rFreq" bind:value={tod.rFreq} type="select" disabled={!tod.dtStart}>
			<option value={null}></option>
			<option value={1}>Daily</option>
			<option value={2} disabled>Weekly</option>
			<option value={3}>Monthly</option>
			<option value={4}>Yearly</option>
		</FormInput>

		<FormInput
			label="Interval"
			name="rInterval"
			value={tod.rInterval}
			type="number"
			min="0"
			disabled={!tod.dtStart || !(tod.rFreq == 1 || tod.rFreq == 4)}
		/>
		<FormInput label="Until" name="rUntil" value={tod.rUntil} type="datetime" disabled={!tod.dtStart || !tod.rFreq} />
		<FormInput name="place" value={tod.place} type="text" maxlength={250} />
		<FormInput name="description" value={tod.description} type="textarea" maxlength={2500} />

		<!-- TODO Add toggles -->
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
		<button
			disabled={!tod.id}
			class:hidden={deleteConfirm}
			type="button"
			onclick={() => (deleteConfirm = true)}
			style="background-color: red;">Delete</button
		>
		<button
			formaction="?/delete"
			disabled={!tod.id}
			class:hidden={!deleteConfirm}
			type="submit"
			style="background-color: red;">You sure?</button
		>
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
