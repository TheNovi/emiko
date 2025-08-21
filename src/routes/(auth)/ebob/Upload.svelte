<script lang="ts">
	import { tick } from "svelte";

	let input: HTMLInputElement;

	let progress = $state(0);
	let total = $state(0);
	let running = $state(false);

	let { onComplete }: { onComplete?: () => any } = $props();

	// const BATCH_SIZE = 2;
	// const CONCURRENT_REQUEST = 2;
	const BATCH_SIZE = 20;
	const CONCURRENT_REQUEST = 1; //Keeps order of files

	async function click() {
		if (!input.files || !input.files.length) return;
		running = true;
		progress = 0;
		total = input.files.length;
		await tick();

		let promises = [];

		for (let i = 0; i < total; ) {
			const data = new FormData();
			// data.append('t', total + '');
			// data.append('p', i + 1 + '');
			let cBatchSize = 0;
			for (let y = i + BATCH_SIZE; i < y && i < total; i++) {
				data.append("files", input.files[i], input.files[i].name);
				cBatchSize++;
			}

			// console.log('r', i - BATCH_SIZE, i);
			promises.push(fetch("", { method: "POST", body: data }).then(() => (progress += cBatchSize)));
			if (promises.length >= CONCURRENT_REQUEST) {
				// console.log('w');
				await tick();
				await Promise.all(promises);
				promises = [];
			}
		}
		running = false;
		if (onComplete) onComplete();
	}
</script>

<input bind:this={input} disabled={running} type="file" name="files" multiple />
<button disabled={running} onclick={click}>Send</button>
<div>{progress}/{total}</div>
