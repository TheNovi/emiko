<script lang="ts">
	import Lorenz, { Points } from "$lib/lorenz";
	import { onMount } from "svelte";

	const COUNT = 5000;
	const SIZE = 3;
	const SCALE = 15;

	let innerWidth: number, innerHeight: number;
	let lastW = 0,
		lastH = 0;
	let canvas: HTMLCanvasElement;
	let cx: CanvasRenderingContext2D;
	let lorenz: { l: Lorenz; c: number }[] = [];

	function recenter() {
		lastW = innerWidth;
		lastH = innerHeight;
		for (let i = 0; i < lorenz.length; i++) {
			//TODO Update scale
			lorenz[i].l.center = [innerWidth / 2, innerHeight / 2];
		}
	}

	function frame() {
		//TODO As shader
		cx.strokeStyle = "white";
		cx.clearRect(0, 0, innerWidth, innerHeight);
		if (lastW !== innerWidth || lastH !== innerHeight) recenter();

		for (let i = 0; i < lorenz.length; i++) lorenz[i].l.step((p) => draw(p, i));

		requestAnimationFrame(frame); //TODO stop offscreen?
	}

	function draw(p: Points, li: number) {
		// cx.strokeStyle = `hsl(${lorenz[li].c}, 100%, 50%)`;

		// console.log(p);
		let l = p.get(0);
		cx.beginPath();
		//TODO Gradient
		for (let i = 1; i < p.length; i++) {
			// cx.fillRect(p[i][0], p[i][1], 1, 1);
			cx.moveTo(l[0], l[1]);
			l = p.get(i);
			cx.lineTo(l[0], l[1]);
		}
		cx.stroke();
	}

	onMount(() => {
		let c = canvas.getContext("2d");
		if (!c) return;
		cx = c;
		cx.lineCap = "round";
		cx.lineJoin = "round";
		cx.strokeStyle = "white";
		for (let i = 0; i < COUNT; i++) {
			lorenz.push({ l: new Lorenz({ xyz: [0, 1, 1.05 + i / 1000], center: [innerWidth / 2, innerHeight / 2], size: SIZE, scale: SCALE }), c: Math.random() * 360 });
		}
		frame();
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<!-- {#if browser} -->
<canvas width={innerWidth} height={innerHeight} bind:this={canvas}></canvas>

<!-- {/if} -->

<style lang="postcss">
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
