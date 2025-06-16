<script lang="ts">
	import type { PageData } from "./$types";
	import Header from "$lib/components/Header.svelte";

	let { data }: { data: PageData } = $props();
</script>

<Header title="Home" />

<div id="c">
	<h1>
		{#if data.user}
			<span id="the">Welcome to</span><span id="novi">&nbsp;Emiko</span>
		{:else}
			<span id="the">The</span><span id="novi">Novi</span>
		{/if}
	</h1>
	{#if data.user}
		<span id="shruge">{data.user.name}</span>
	{:else}
		<span id="shruge">¯\_(ツ)_/¯</span>
	{/if}
	<ul>
		{#if data.user}
			<li>&gt;<a href="/ebob">Ebob</a>&lt;</li>
		{/if}
		<!-- <li>&gt;<a href="/bob">bob</a>&lt;</li> -->
		<li>&gt;<a href="/stroll">stroll</a>&lt;</li>
	</ul>
</div>

<style lang="postcss">
	#c {
		position: fixed;
		inset: 0;
		margin: auto;
		width: fit-content;
		height: fit-content;
		text-align: center;
		user-select: none;
	}
	h1 {
		font-size: 4rem;
		line-height: 1;
		color: white;
		margin: 0;
	}

	#the {
		animation: appear 5s;
	}
	#novi {
		opacity: 0;
		animation: appear 5s forwards 1s;
	}

	#shruge {
		display: block;
		/* margin-top: 8px; */
		margin-bottom: 8px;
		opacity: 0;
		animation: appear 5s forwards 3s;
	}

	/* ul {
		list-style: none;
		padding: 0;
		margin: 0;
	} */
	ul {
		font-size: 19px;
	}
	li a {
		text-decoration: underline;
		margin-inline: 2px;
	}
</style>
