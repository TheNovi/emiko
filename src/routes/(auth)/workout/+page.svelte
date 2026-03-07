<script lang="ts">
	import { enhance } from "$app/forms";
	import FormInput from "$lib/components/FormInput.svelte";
	import Title from "$lib/components/Title.svelte";
	import type { WoMachine } from "$lib/server/workout";
	import { SvelteSet } from "svelte/reactivity";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	let searchText = $state("");
	let results = $derived(
		data.machines.filter((m) => {
			// return searchText && (m.name + " " + m.tags).includes(searchText); //WIP :) //TODO
			return (
				searchText &&
				searchText
					.trim()
					.split(" ")
					.every((t) => {
						return (m.name + " " + m.tags + " " + m.text).includes(t);
					})
			);
		})
	);
	//Get tags from all machines or filtered machines (if searching). Remove repetition
	let tags = $derived(new SvelteSet((searchText ? results : data.machines).flatMap((m) => m.tags.split(" "))));

	let selectedMachine: WoMachine = $state(copyMachine());
	function copyMachine(m?: (typeof data.machines)[0]): WoMachine {
		return m
			? { ...m }
			: { id: 0, name: "", text: "", reps: 10, sets: 2, value: 0, unit: 0, pause: 0, qrCode: "", tags: "" };
	}

	function clearFormVar() {
		if (!form) return;
		form = null;
	}

	// $inspect(data);
	// $inspect(form);
	// $inspect(tags);
</script>

<Title title="Workout" />

<h1>Gotta Lift 'Em All</h1>

<!-- Search -->
<input type="text" name="search" id="search" bind:value={searchText} />
<!-- Search result -->
<div id="tags">
	{#each tags as tag}
		{#if tag && !searchText.includes(tag)}
			<button class="tag" onclick={() => (searchText += " " + tag)}>{tag}</button>
		{/if}
	{/each}
</div>
{results.length}/{data.machines.length}
{#if searchText}
	{#each results as m (m.id)}
		<button
			class="machine"
			onclick={() => (selectedMachine = copyMachine(m))}
			command="show-modal"
			commandfor="machine"
		>
			{m.name}
		</button>
	{:else}
		<div id="noRes">No result</div>
	{/each}
{/if}
<button id="Add" onclick={() => (selectedMachine = copyMachine())} command="show-modal" commandfor="machine">
	Add Machine
</button>
<dialog id="machine" onclose={clearFormVar} closedby="any">
	<form
		method="post"
		use:enhance={({ formData }) => {
			// deleteConfirm = false;
			// formDatesToISO(formData, ["dtStart", "dtEnd", "rUntil"]);
			//TODO Try to not to send text every time (others doesn't matter too much)
			return async ({ update }) => {
				update({ reset: false });
			};
		}}
	>
		{#each form?.errors || [] as e (e)}
			<div class="error">{e}</div>
		{/each}
		<input type="hidden" name="id" id="id" value={selectedMachine.id} />
		Machine {selectedMachine.id}
		<FormInput name="name" type="text" value={selectedMachine.name} />
		<FormInput name="tags" type="text" value={selectedMachine.tags} />
		<FormInput name="reps" type="number" value={selectedMachine.reps} min="0" />
		<FormInput name="sets" type="number" value={selectedMachine.sets} min="0" />
		<FormInput name="value" type="number" value={selectedMachine.value} min="0" />
		<FormInput name="unit" type="number" value={selectedMachine.unit} min="0" />
		<!-- TODO Active only if sets > 0 -->
		<FormInput name="pause" type="number" value={selectedMachine.pause} min="0" />
		<!-- TODO As textarea? -->
		<FormInput name="text" type="text" value={selectedMachine.text} />
		<!-- TODO Bigger buttons -->
		<button formaction="?/machineSave" type="submit" style="background-color: green;">Save</button>
		<button command="close" commandfor="machine" type="button">Close</button>
		<!-- TODO Add as Activity -->
		<!-- TODO Save and Add as Activity -->
		<!-- TODO Delete -->
	</form>
</dialog>
<!-- Activity -->
{#each data.act as act (act.workout_activity.id)}
	<div></div>
{:else}
	<h2>Get to work!</h2>
{/each}

<style lang="postcss">
	:global(main) {
		/* TODO As context */
		width: 95vw;
		margin: auto;
	}
	h1,
	h2 {
		margin: 5vw;
		text-align: center;
	}
	#search {
		border: 0;
		display: block;
		width: 100%;
		height: 3vh;
		font-size: 2vh;
		background-color: #333;
		color: white;
		margin-bottom: 2px;
	}
	#tags {
		margin-top: 1vh;
		margin-bottom: 1vh;
		user-select: none;
	}
	.tag {
		display: inline-block;
		border-radius: 10px;
		background-color: #333;
		padding: 0.5em;
		margin-left: 5px;
	}
	#noRes {
		text-align: center;
	}

	button#Add {
		border-radius: 25px;
		display: block;
		width: 100%;
		height: 4vh;
		background-color: green;
		margin-top: 5vh;
	}

	button.machine {
		border-radius: 25px;
		display: block;
		width: 100%;
		height: 4vh;
		background-color: #222;
		margin-bottom: 1vh;
	}

	dialog {
		/* width: 90vw;
		height: 90vh; */
	}
</style>
