<script lang="ts">
	import { page } from '$app/state';
	import { clickedOutsideOfNode } from '$lib/util/directives.svelte';

	type Image = {
		id: number;
		favorite: boolean;
		public: boolean;
		description: string;
		takenAt: Date;
	};

	let img: Image | undefined = $state();
	let loading: boolean = $state(false);

	let { pub, close }: { pub: boolean; close?: () => any } = $props();

	export function openImageDetail(id: number) {
		loading = true;
		let q = new URL(`/bob/f/${id}/desc`, page.url);
		if (pub) q.searchParams.append('public', 'true'); //This filters out private images if user IS logged in
		//TODO Error
		fetch(q)
			.then((r) => r.json())
			.then((r: Image) => {
				img = r;
				loading = false;
			});
	}

	function hideImageDetail() {
		img = undefined;
		if (close) close();
	}
</script>

{#if img}
	<div id="curtain">
		<div id="modal" use:clickedOutsideOfNode={() => hideImageDetail()}>
			<div id="c">
				{#if img}
					<div id="l">
						<img src={'/bob/f/' + img.id} alt={img.id + ''} />
					</div>
					<div id="r">
						<!-- <section><span>Taken at: </span> {img.takenAt.toISOString()}</section> -->
						<section><span>Public: </span> {img.public}</section>
						<div>Description:</div>
						<div class="wrap">
							{img.description ||
								'Empty sd qwe zxc dsfo oihj iqhode iqwdoq  asd anid noaidnoa ndaodnhaisdaoidadoa doa dnoandoasdnoaidn aod iandoa dnaodn aodinao daso dandoadaodaodadaod'}
						</div>
						<br />
						<button type="button" onclick={() => hideImageDetail()}>Close</button>
					</div>
				{:else}
					<div>File not found</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	#curtain {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		background-color: #000000f0;
		/* Margin for modal */
		padding-left: 5vw;
		padding-right: 5vw;
	}
	#modal {
		display: block;
		position: relative;
		background-color: black;
		box-sizing: border-box;
		overflow: hidden;
		margin: auto;
		max-width: max-content;
		height: 90vh;
		top: 5%;
		/* left: 50%; */
		/* top: 50%; */
		/* transform: translate(-50%, -50%); */
	}

	#c {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: stretch;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	#l img {
		object-fit: contain;
		width: 100%;
		height: 100%;
	}

	#r {
		background-color: gray;
		padding: 4px;
		text-wrap: nowrap;
		overflow-y: auto;
		min-width: min-content;
		width: min-content;
	}

	.wrap {
		text-wrap: wrap;
	}
</style>
