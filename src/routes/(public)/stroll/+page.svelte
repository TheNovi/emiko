<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { random, sleep } from '$lib/util';
	import Place from './Place.svelte';
	import WeeklyStrollCountdown from './WeeklyStrollCountdown.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let picking = $state(false);
	let place: PageData['week'] | undefined = $state(undefined);
	async function getRandomPlace(depth = 0) {
		if (depth) console.log(`Stroll | same place d=${depth}`, data.week);
		if (picking) return;
		picking = true;
		let p: typeof place;
		await Promise.all([
			fetch('/stroll/api')
				.then((r) => r.json())
				.then((r) => (p = r)),
			depth ? undefined : sleep(random(1, 3) * 1000),
		]);
		picking = false;
		if (depth < 3 && (!p || p.name == data.week.name)) return getRandomPlace(depth + 1); //Pick another if same or empty
		place = p;
	}
	// $effect(() => console.log(data.week));
</script>

<Header title="Stroll" />
<div id="c">
	Chceš na výlet, ale nevíš kam? Zde najdeš každý týden nový tip kam vyrazit. A pokud daná lokace
	zrovna nebude vyhovovat, tak si jednoduše vylosuješ novou.
	<div id="countdown">
		Další místo bude vylosováno za: <div><WeeklyStrollCountdown /></div>
	</div>
	<!-- Week stroll -->
	<Place place={data.week} picking={false} />

	<button type="button" disabled={picking} onclick={() => getRandomPlace()}>
		{#if !place}
			Nebo si vylosovuj vlastní!
		{:else}
			Zkus štěstí znovu!
		{/if}
	</button>
	<!-- User stroll -->
	<Place {place} {picking} />
</div>

<style lang="postcss">
	#c {
		margin-top: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	#c #countdown {
		margin: 8px;
		font-size: 0.75;
	}
	#c button {
		margin: 8px;
		width: fit-content;
		height: fit-content;
	}
</style>
