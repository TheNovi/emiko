<script lang="ts">
	import { shuffle } from "$lib/util";
	import type { PageProps } from "./$types";

	// import type { PageProps } from "./$types";
	type Cell = { value: number; hidden: boolean };

	let { data }: PageProps = $props();

	//Config
	let size = $state(8);
	let ciphers = $state(3);
	let hideAll = $state(false);

	//Inner state
	let topOffset = $derived((data.user ? 24 : 0) + 33 + 21 + 10 + 5);
	let w: number = $state(0);
	let h: number = $state(0);
	let cellSize = $derived(Math.floor(Math.min(h - topOffset, w) / size));
	let grid: Cell[] = $state([]);
	// 0=End, 1=Start, 2=Hidden, 3=Win, 4=Loss
	let gameState: number = $state(0);
	let score = 0;

	function configChanged() {
		// gameOver(false);
		grid = [];
		gameState = 0;
	}
	function setSize(v: number) {
		configChanged();
		size = v;
	}
	function setCiphers(v: number) {
		configChanged();
		ciphers = v;
	}
	function setHideAll(v: boolean) {
		configChanged();
		hideAll = v;
	}

	function genGrid() {
		const o: Cell[] = [];
		for (let i = 0; i < size * size; i++) {
			o.push({ value: i < ciphers ? i + 1 : 0, hidden: true });
		}
		shuffle(o);
		score = 0;
		grid = o;
	}

	function getCellText(cell: Cell) {
		return cell.value ? cell.value + "" : "";
	}

	function ready() {
		genGrid();
		gameState = 1;
	}
	function go() {
		if (gameState != 1) return;
		gameState = 2;
		score = 0;
	}

	function gameOver(win = false) {
		if (win) {
			console.log("Win");
			gameState = 3;
			return;
		}
		console.log("Game Over");
		gameState = 4;
	}
	// ready();
	// go();

	function cellClick(i: number) {
		if (gameState != 2) return;
		if (!grid[i].hidden) return;
		if (!hideAll && !grid[i].value) return;
		if (grid[i].value != score + 1) gameOver();
		grid[i].hidden = false;
		score++;
		if (score + 1 > ciphers) gameOver(true);
	}
</script>

<svelte:window bind:innerWidth={w} bind:innerHeight={h} />

<div id="conf">
	<div>
		<label for="size">Size</label>
		<input id="size" type="number" bind:value={() => size, setSize} min={Math.ceil(Math.sqrt(ciphers))} max={50} />
	</div>
	<div>
		<label for="ciphers">Ciphers</label>
		<input id="ciphers" type="number" bind:value={() => ciphers, setCiphers} min={1} max={size * size} />
	</div>
	<div>
		<input id="hideAll" type="checkbox" bind:checked={() => hideAll, setHideAll} />
		<label for="hideAll">HideAll</label>
	</div>
</div>
<button
	id="start"
	class:win={gameState == 3}
	class:loss={gameState == 4}
	onmousedown={ready}
	onmouseup={go}
	onmouseleave={go}>Start</button
>

<div
	id="grid"
	class:win={gameState == 3}
	class:loss={gameState == 4}
	style={`grid-template-columns: repeat(${size}, auto);`}
>
	{#each grid as cell, i (i)}
		{@const hidden = gameState == 2 && cell.hidden && (cell.value || hideAll)}
		{@const border = 2}
		<button
			class="cell"
			class:hidden
			style={`max-width: ${cellSize - border}px;line-height: ${cellSize - border}px;font-size: ${cellSize - border}px`}
			onclick={() => cellClick(i)}
		>
			{hidden ? "&nbsp;" : getCellText(cell)}
		</button>
	{/each}
</div>

<style lang="postcss">
	#conf {
		display: flex;
		flex-direction: row;
	}
	#conf label {
		user-select: none;
	}
	#start {
		width: 100%;
		background-color: #101010;
		color: inherit;
		border: 0;
		font-size: 20px;
	}

	#grid {
		display: grid;
		max-width: 100vw;
		max-height: 100vh;
		overflow: hidden;
		margin-top: 10px;
	}
	.win {
		color: green !important;
	}
	.loss {
		color: red !important;
	}

	.cell {
		display: block;
		margin: 1px;
		aspect-ratio: 1;
		text-align: center;
		/* outline: 1px solid green; */

		/*Remove button styles*/
		background-color: transparent;
		color: inherit;
		border: 0;
		padding: 0;
		cursor: inherit;
	}

	.cell.hidden {
		background-color: white;
		color: transparent;
		cursor: pointer;
	}
</style>
