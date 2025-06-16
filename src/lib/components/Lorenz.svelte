<script lang="ts">
	import Lorenz, { Points } from "$lib/lorenz";
	import { onMount } from "svelte";

	let { color = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`, count = 2000, size = 3, scale = 15, style = "" } = $props();

	let innerWidth = $state(0),
		innerHeight = $state(0);
	let lastW = 0,
		lastH = 0;
	let canvas: HTMLCanvasElement;
	let cx: CanvasRenderingContext2D;
	let lorenz: { l: Lorenz; c: number }[] = [];

	function recenter() {
		lastW = innerWidth;
		lastH = innerHeight;
		cx.strokeStyle = color;
		for (let i = 0; i < lorenz.length; i++) {
			//TODO Update scale
			lorenz[i].l.center = [innerWidth / 2, innerHeight / 2];
		}
	}

	function frame() {
		//TODO As shader
		cx.clearRect(0, 0, innerWidth, innerHeight);
		if (lastW !== innerWidth || lastH !== innerHeight) recenter();
		for (let i = 0; i < lorenz.length; i++) lorenz[i].l.step((p) => draw(p, i));
		requestAnimationFrame(frame);
	}

	function draw(p: Points, li: number) {
		// cx.strokeStyle = `hsl(${lorenz[li].c}, 100%, 50%)`;
		let l = p.get(0);
		cx.beginPath();
		for (let i = 1; i < p.length; i++) {
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
		for (let i = 0; i < count; i++) {
			lorenz.push({ l: new Lorenz({ xyz: [0, 1, 1.05 + i / 10000], center: [innerWidth / 2, innerHeight / 2], size, scale }), c: Math.random() * 360 });
		}
		frame();
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<!-- {#if browser} -->
<canvas {style} width={innerWidth} height={innerHeight} bind:this={canvas}></canvas>

<!-- {/if} -->

<style lang="postcss">
	canvas {
		width: 100%;
		height: 100%;
	}

	canvas {
		position: absolute;
	}
</style>
