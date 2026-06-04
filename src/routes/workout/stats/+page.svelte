<script lang="ts">
	import { DateTime } from "luxon";
	import type { PageProps } from "./$types";
	import DateView from "$lib/components/DateView.svelte";

	let { data }: PageProps = $props();
</script>

<h2>Workout Stats for {data.user?.name}</h2>

<a id="exit" href="/workout">Back to work</a>

<!-- Activity -->
<div id="history">
	{#each data.acts as act, i (act.id)}
		<div>
			<!-- TODO 0 Optimize -->
			{#if i == 0 || data.acts[i - 1].createdAt.toDateString() != act.createdAt.toDateString()}
				<DateView date={DateTime.fromJSDate(act.createdAt).startOf("day")} />
			{/if}
		</div>
		<a href={`/workout/act/${act.id}`} class="activity">
			{act.mName}
			{act.reps}x{act.sets}
			{#if act.value}
				-
				{act.value}
				{act.mUnit}
			{/if}
			-
			{DateTime.fromJSDate(act.createdAt).toFormat("HH:mm")}
		</a>
	{:else}
		<h2>Get to work!</h2>
	{/each}
</div>

<style lang="postcss">
	h2 {
		margin: 5vw;
		text-align: center;
	}

	a#exit {
		display: block;
		width: 95vw;
		margin: auto;
		padding: 0.6em;
		margin-bottom: 3vh;
		text-align: center;
		text-decoration: underline;
	}

	#history div {
		text-align: center;
		margin: 1vh;
	}

	#history .activity {
		display: block;
		width: 95vw;
		margin: auto;
		padding: 1vh;
		background-color: #222;
		margin-bottom: 1vh;
		text-align: center;
		border-radius: 25px;
	}
</style>
