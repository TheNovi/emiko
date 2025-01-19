<script lang="ts">
	import type { PageData } from './$types';

	let { data, close }: { data: PageData; close?: () => any } = $props();
</script>

<div id="c">
	{#if data.f}
		<div id="l">
			<img src={'/bob/f/' + data.f.id} alt={data.f.id + ''} />
		</div>
		<div id="r">
			<section><span>Taken at: </span> {data.f.takenAt.toISOString()}</section>
			<section><span>Public: </span> {data.f.public}</section>
			<div>Description:</div>
			<div class="wrap">
				{data.f.description ||
					'Empty sd qwe zxc dsfo oihj iqhode iqwdoq  asd anid noaidnoa ndaodnhaisdaoidadoa doa dnoandoasdnoaidn aod iandoa dnaodn aodinao daso dandoadaodaodadaod'}
			</div>
			{#if close}
				<br />
				<button type="button" onclick={() => close()}>Close</button>
			{/if}
		</div>
	{:else}
		<div>File not found</div>
	{/if}
</div>

<style lang="postcss">
	/* Size and position of c is in layout */
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
