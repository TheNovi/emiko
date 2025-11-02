<script lang="ts">
	import { GPoint, GraphMode, LorenzDefaults, Points, type LorenzConsts } from "$lib/graphAnim";
	import { onMount } from "svelte";

	let {
		mode,
		color = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
		count = 2000,
		size = 3,
		scale = 15,
		rotateDeg = 0,
		style = "",
	}: { mode: GraphMode; color?: string; count?: number; size?: number; scale?: number; rotateDeg?: number; style?: string } = $props();

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
		// setTimeout(frame, 100);
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
		const config: GPoint["config"] = {
			center,
			rotateDeg,
			scale,
			size,
			offsetCenter: [0, 0],
			fun: () => {},
		};
		switch (mode) {
			case GraphMode.Lorenz:
				config.fun = (s: GPoint, c: LorenzConsts, dt: number) => {
					let dx = c.o * (s.y - s.x);
					let dy = s.x * (c.p - s.z) - s.y;
					let dz = s.x * s.y - c.b * s.z;
					s.x += dx * dt;
					s.y += dy * dt;
					s.z += dz * dt;
				};
				for (let i = 0; i < count; i++) {
					points.push(new GPoint([0, 1, 1.05 + i / 10000], config, LorenzDefaults.BASIC));
				}
				break;
			case GraphMode.LorenzButterFly:
				config.fun = (s: GPoint, c: LorenzConsts, dt: number) => {
					let dx = s.y * s.z - c.b * s.x;
					let dy = c.o * (s.z - s.y);
					let dz = s.y * (c.p - s.x) - s.z;
					s.x += dx * dt;
					s.y += dy * dt;
					s.z += dz * dt;
				};
				config.offsetCenter[1] = 450;
				config.scale *= 1.1;
				config.rotateDeg = -Math.PI / 2;
				for (let i = 0; i < count; i++) {
					points.push(new GPoint([29, -8, -2 + i / 100], config, LorenzDefaults.BASIC));
				}
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
