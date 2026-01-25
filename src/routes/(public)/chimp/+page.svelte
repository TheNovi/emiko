<script lang="ts">
	import { shuffle } from "$lib/util";

	// import type { PageProps } from "./$types";
	type Cell = { value: number; hidden: boolean };

	// let { data }: PageProps = $props();

	//Config
	let size = $state(8);
	let ciphers = $state(3);
	let hideAll = $state(false);

	//Inner state
	let w: number = $state(0);
	let h: number = $state(0);
	let cellSize = $derived(Math.floor(Math.min(h - 100, w) / size));
	let grid: Cell[] = $state([]);
	// 0=End, 1=Start, 2=Hidden, 3=Win, 4=Loss
	let gameState: number = $state(0);
	let score = 0;

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
	// start();

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
		<input id="size" type="number" bind:value={size} />
	</div>
	<div>
		<label for="ciphers">Ciphers</label>
		<input id="ciphers" type="number" bind:value={ciphers} />
	</div>
	<div>
		<input id="hideAll" type="checkbox" bind:checked={hideAll} />
		<label for="hideAll">HideAll</label>
	</div>
</div>
<button id="start" class:win={gameState == 3} class:loss={gameState == 4} onmousedown={ready} onmouseup={go} onmouseleave={go}>Start</button>

<div id="grid" class:win={gameState == 3} class:loss={gameState == 4} style={`grid-template-columns: repeat(${size}, auto);`}>
	{#each grid as cell, i (i)}
		{@const hidden = gameState == 2 && cell.hidden && (cell.value || hideAll)}
		<button class="cell" class:hidden style={`max-width: ${cellSize}px;line-height: ${cellSize}px;font-size: ${cellSize}px`} onclick={() => cellClick(i)}>
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
		gap: 1px;
		max-width: 100vw;
		max-height: 100vh;
		overflow: hidden;
	}
	.win {
		color: green !important;
	}
	.loss {
		color: red !important;
	}

	.cell {
		display: block;
		aspect-ratio: 1;
		text-align: center;
		/* outline: 1px solid green; */

		/*Remove button styles*/
		background-color: transparent;
		color: inherit;
		border: 0;
	}

	.cell.hidden {
		background-color: white;
		color: transparent;
	}
</style>
