<script lang="ts">
	import { GPoint, GraphMode, LorenzDefaults, Points, type LorenzConsts, type ThreeBodyConsts } from "$lib/graphAnim";
	import { onMount } from "svelte";

	let {
		mode,
		color = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
		count = 2000,
		size = 3,
		scale = 15,
		style = "",
	}: { mode: GraphMode; color?: string; count?: number; size?: number; scale?: number; style?: string } = $props();

	let innerWidth = $state(0),
		innerHeight = $state(0);
	const center = [0, 0];
	let canvas: HTMLCanvasElement;
	let cx: CanvasRenderingContext2D;
	let points: GPoint[] = [];
	let running = $state(true);

	function recenter() {
		cx.strokeStyle = color;
		//TODO Update scale
		center[0] = innerWidth / 2;
		center[1] = innerHeight / 2;
	}

	function frame() {
		//TODO As shader
		if (!running) return;
		cx.clearRect(0, 0, innerWidth, innerHeight);
		if (center[0] !== innerWidth / 2 || center[1] !== innerHeight / 2) recenter();
		for (let i = 0; i < points.length; i++) points[i].step((p) => draw(p, i));
		requestAnimationFrame(frame);
		// setTimeout(frame, 1000);
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
		switch (mode) {
			case GraphMode.Lorenz:
				const f = (s: GPoint, c: LorenzConsts, dt: number) => {
					let dx = c.o * (s.y - s.x);
					let dy = s.x * (c.p - s.z) - s.y;
					let dz = s.x * s.y - c.b * s.z;
					s.x += dx * dt;
					s.y += dy * dt;
					s.z += dz * dt;
				};
				for (let i = 0; i < count; i++) {
					// points.push(new Lorenz({ xyz: [0, 1, 1.05 + i / 10000], center, size, scale }));
					points.push(new GPoint({ xyz: [0, 1, 1.05 + i / 10000], center, size, scale }, LorenzDefaults.BASIC, f));
				}
				break;
			case GraphMode.ThreeBody:
				scale = 1;
				const G = 10;
				let p = (s: number, b: number, m: number) => -G * m * ((s - b) / Math.pow(Math.abs(s - b), 3));
				let getFun = (i: number) => {
					return (s: GPoint, c: ThreeBodyConsts, dt: number) => {
						//Its 4am and I am too stupid for this https://en.wikipedia.org/wiki/Three-body_problem (I should just find some youtube tutorial)
						const b1 = points[(i + 1) % 3];
						const b2 = points[(i + 2) % 3];
						let [x, y, z] = [s.x, s.y, s.z];
						let dx = p(x, b1.x, c.m) + p(x, b2.x, c.m);
						let dy = p(y, b1.y, c.m) + p(y, b2.y, c.m);
						let dz = p(z, b1.z, c.m) + p(z, b2.z, c.m);
						s.x += dx * dt;
						s.y += dy * dt;
						s.z += dz * dt;
						// console.log(s.x, s.y, s.z);
					};
				};
				points.push(new GPoint({ xyz: [100, 100, 100], center, size, scale }, { m: 1 }, getFun(points.length)));
				points.push(new GPoint({ xyz: [210, 211, 212], center, size, scale }, { m: 2 }, getFun(points.length)));
				points.push(new GPoint({ xyz: [320, 321, 322], center, size, scale }, { m: 3 }, getFun(points.length)));
				break;
		}
		frame();
		return () => {
			running = false;
		};
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<!-- {#if browser} -->
<canvas {style} width={innerWidth} height={innerHeight} bind:this={canvas}></canvas>

<!-- {/if} -->

<style lang="postcss">
	canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
