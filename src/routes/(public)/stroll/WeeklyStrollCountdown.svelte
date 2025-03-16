<script lang="ts">
	import { onMount } from 'svelte';

	let d: number = getNextWeekDate();
	let text: string = $state('');

	updateTime();
	onMount(() => {
		const interval = setInterval(updateTime, 1000);

		return () => {
			clearInterval(interval);
		};
	});

	function getNextWeekDate() {
		let n = new Date();
		n.setUTCDate(n.getUTCDate() + 7 - ((6 + n.getUTCDay()) % 7)); //Next Monday (my solution)
		// n.setUTCDate(n.getUTCDate() + ((7 - n.getUTCDay()) % 7) + 1); //Next Monday (from internet)
		n.setUTCHours(0, 0, 0, 0);
		return n.getTime();
	}

	function updateTime() {
		let pad = (n: number) => ('0000' + n).slice(-2);

		let t = d - new Date().getTime();
		if (t < 0) {
			d = getNextWeekDate();
			t = d - new Date().getTime();
		}

		t = Math.floor(t / 1000);
		text = pad(t % 60) + ''; //Sec
		t = Math.floor(t / 60);
		text = pad(t % 60) + ':' + text; //Min
		t = Math.floor(t / 60);
		text = pad(t % 24) + ':' + text; //Hour
		t = Math.floor(t / 24);
		if (t > 0) text = t + ' ' + (t > 4 ? 'dní' : t > 1 ? 'dny' : 'den') + ' ' + text; //Days
	}
</script>

{text}
