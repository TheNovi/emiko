<script lang="ts">
	import FormInput from "$lib/components/FormInput.svelte";
	import { DateTime, Duration } from "luxon";
	import { onDestroy } from "svelte";
	import type { PageProps } from "./$types";
	import { goto } from "$app/navigation";

	let { data }: PageProps = $props();
	//Reactive values (for bindings)
	let act = $derived.by(() => {
		let v = $state(data.act);
		return v;
	});

	const STATES = {
		IN_SET: 1,
		PAUSE: 2,
		END: 3,
	};

	let cState: number = $state(STATES.IN_SET);
	let cSet: number = $state(0);

	let interval = setInterval(t, 1000);
	let timer: Duration = $derived(DateTime.fromJSDate(act.updatedAt).diffNow().negate());
	let timerStr: string = $derived(timer.toFormat("mm:ss"));
	// let timerStr: string = $derived(timer.toString());
	function t() {
		if (cState == STATES.IN_SET) timer = DateTime.fromJSDate(act.updatedAt).diffNow().negate();
		if (cState == STATES.PAUSE) timer = DateTime.fromJSDate(act.updatedAt).diffNow().plus({ seconds: act.mPause });
	}

	function switchState() {
		act.updatedAt = new Date();
		if (cState == STATES.END) return saveAndClose();
		if (cState == STATES.IN_SET) cSet++;

		if (cSet >= act.sets) cState = STATES.END;
		else if (cState == STATES.IN_SET) cState = STATES.PAUSE;
		else if (cState == STATES.PAUSE) cState = STATES.IN_SET;
		t();
	}

	async function save() {
		// TODO 99 Save cState and cSet
		console.log("Saving act:", $state.snapshot(act));
	}

	async function saveAndClose() {
		await save();
		goto("/workout");
	}

	onDestroy(() => {
		clearInterval(interval);
	});

	// $inspect(cState);
</script>

<h2>{act.mName}</h2>
<FormInput name="reps" type="number" bind:value={act.reps} min="0" />
<FormInput name="sets" type="number" bind:value={act.sets} min="0" />
<FormInput name="value" type="number" bind:value={act.value} min="0" />
<!-- TODO {act.mUnit} -->
<div>{act.mText}</div>
Completed sets: {cSet}/{act.sets}
{#if cState == STATES.IN_SET}
	<h2>Do your set. You can do it!</h2>
	{timerStr}
{:else if cState == STATES.PAUSE}
	<h2>Time to slowdown</h2>
	{timerStr}
{:else if cState == STATES.END}
	<h2>Congrats</h2>
	You did total: {cSet * act.reps} reps!
{/if}
{#if cSet < act.sets}
	<button onclick={switchState}>Next</button>
{/if}
<button onclick={saveAndClose}>End</button>
