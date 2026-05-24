<script lang="ts">
	import { enhance } from "$app/forms";
	import FormInput from "$lib/components/FormInput.svelte";
	import Title from "$lib/components/Title.svelte";
	import type { WoMachine } from "$lib/server/workout";
	import { DateTime } from "luxon";
	import { SvelteSet } from "svelte/reactivity";
	import type { ActionData, PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	let searchText = $state("");
	let results = $derived(
		data.machines.filter((m) => {
			// return true; //Debug
			return (
				(searchText &&
					searchText
						.trim()
						.toLowerCase()
						.split(" ")
						.every((t) => {
							return m.name.toLowerCase().includes(t);
						})) ||
				isMachineTagsSelected(m)
			);
		})
	);
	function isMachineTagsSelected(m: { [key: string]: any }) {
		for (const k of selectedTags) if (m[k] !== true) return false;
		return selectedTags.size > 0;
	}

	let tags = ["cardio", "hands", "legs", "belly", "push", "pull", "other"];
	let selectedTags = $state(new SvelteSet<string>());

	let selectedMachine: WoMachine = $state(copyMachine());
	function copyMachine(m?: (typeof data.machines)[0]): WoMachine {
		return m
			? { ...m }
			: {
					id: 0,
					name: "",
					text: "",
					reps: 10,
					sets: 4,
					value: 0,
					unit: "",
					tags: "",
					hands: false,
					legs: false,
					belly: false,
					push: false,
					pull: false,
					cardio: false,
					other: false,
				};
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
		{#if selectedTags.has(tag)}
			<button class="tag sel" onclick={() => selectedTags.delete(tag)}>{tag}</button>
		{:else}
			<button class="tag" onclick={() => selectedTags.add(tag)}>{tag}</button>
		{/if}
	{/each}
</div>
{results.length}/{data.machines.length}
<!-- {#if searchText || selectedTags.size > 0} -->
<!-- TODO Show all tag -->
{#each results as m (m.id)}
	<!-- TODO Show sets + value + unit-->
	<button class="machine" onclick={() => (selectedMachine = copyMachine(m))} command="show-modal" commandfor="machine">
		{m.name}
	</button>
{:else}
	<div id="noRes">No result</div>
{/each}
<!-- {/if} -->
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
			return async ({ update, result, formElement }) => {
				await update({ reset: false });
				if (result.type == "success" && result.data) {
					const d: ActionData = result.data as any;
					if (d?.o?.id) selectedMachine.id = (result.data as any).o.id;
					if (d?.close) (formElement.parentElement as HTMLDialogElement).close();
				}
			};
		}}
	>
		{#each form?.errors || [] as e (e)}
			<div class="error">{e}</div>
		{/each}
		<FormInput type="hidden" name="id" value={selectedMachine.id} />
		Machine {selectedMachine.id}
		<FormInput name="name" value={selectedMachine.name} type="text" />
		<!-- TODO Remove -->
		<FormInput name="tags" value={selectedMachine.tags} type="text" disabled />
		<!-- TODO Tags as inline buttons (just visually) -->
		<FormInput name="cardio" value={selectedMachine.cardio} type="checkbox" />
		<FormInput name="hands" value={selectedMachine.hands} type="checkbox" />
		<FormInput name="legs" value={selectedMachine.legs} type="checkbox" />
		<FormInput name="belly" value={selectedMachine.belly} type="checkbox" />
		<FormInput name="push" value={selectedMachine.push} type="checkbox" />
		<FormInput name="pull" value={selectedMachine.pull} type="checkbox" />
		<FormInput name="other" value={selectedMachine.other} type="checkbox" />
		<FormInput name="reps" value={selectedMachine.reps} type="number" min="0" />
		<FormInput name="sets" value={selectedMachine.sets} type="number" min="0" />
		<FormInput name="value" value={selectedMachine.value} type="number" step="0.1" min="0" />
		<FormInput name="unit" value={selectedMachine.unit} type="text" />
		<FormInput name="text" value={selectedMachine.text} type="textarea" />
		<button formaction="?/activityAdd" type="submit" id="act">Activity</button>
		<!-- TODO Bigger buttons -->
		<button formaction="?/save" type="submit" style="background-color: green;">Save</button>
		<!-- TODO Delete confirm -->
		<button formaction="?/delete" type="submit" style="background-color: red;">Delete</button>
		<button command="close" commandfor="machine" type="button">Close</button>
	</form>
</dialog>
<!-- Activity -->
{#each data.act as act (act.id)}
	<a href={`/workout/act/${act.id}`} class="activity">
		{act.mName} -
		{DateTime.fromJSDate(act.updatedAt).toFormat("HH:mm")}
	</a>
{:else}
	<h2>Get to work!</h2>
{/each}

<style lang="postcss">
	h1,
	h2 {
		margin: 5vw;
		text-align: center;
	}
	#search {
		border: 0;
		display: block;
		width: 99vw;
		margin: auto;
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
	.tag.sel {
		background-color: green;
	}
	#noRes {
		text-align: center;
	}

	button#Add {
		display: block;
		width: 95vw;
		margin: auto;
		padding: 0.6em;
		background-color: green;
		margin-top: 5vh;
		margin-bottom: 2vh;
	}

	.machine {
		display: block;
		width: 95vw;
		margin: auto;
		padding: 0.6em;
		background-color: #222;
		margin-bottom: 1vh;
	}
	.activity {
		display: block;
		width: 95vw;
		margin: auto;
		padding: 1vh;
		background-color: #222;
		margin-bottom: 1vh;
		text-align: center;
		border-radius: 25px;
	}

	dialog#machine {
		margin-top: 2em;
		/* width: 90vw; */
		/* height: 90vh; */
	}
	dialog#machine button#act {
		display: block;
		margin-top: 1em;
		margin-bottom: 1em;
		width: 100%;
		background-color: blue;
	}
</style>
