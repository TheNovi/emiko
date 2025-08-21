<script lang="ts">
	import type { PageData } from "./$types";

	const { place, picking = false }: { place: PageData["week"] | undefined; picking: boolean } = $props();
	const pickingText = "Losuji...";
	// $effect(() => console.log(place));
</script>

{#snippet link(title: string, prefix: string, link: string | null, ico: string)}
	{#if link}
		<li>
			<a href={prefix + link} {title} target="_blank" rel="noopener noreferrer">
				<!-- <img src={ico ? ico : `//www.google.com/s2/favicons?domain=${prefix}&sz=20`} class="size-[20px]" alt={title} /> -->
				<img src={ico ? ico : `https://www.google.com/s2/favicons?domain=${prefix}&sz=20`} alt={title} />
			</a>
		</li>
	{/if}
{/snippet}

{#if picking}
	<span>
		{#each pickingText as t, i}
			<span class="picking" style="animation-delay: {i / 5}s;">{t}</span>
		{/each}
	</span>
{:else if place}
	<div class="place">
		<h2>{place.name}</h2>
		<span class="mb-1">{place.region}</span>
		<ul>
			{@render link("Google", "//google.cz/search?q=", place.name, "")}
			{@render link("Google Maps", "//www.google.com/maps/search/", place.name, "//www.google.com/images/branding/product/ico/maps15_bnuw3a_32dp.ico")}
			{@render link("Turistické známky", "//turisticke-znamky.cz/znamky/", place.name + "-c" + place.tz, "")}
		</ul>
	</div>
{/if}

<style lang="postcss">
	.picking {
		animation: blink 1s both 0s infinite alternate;
	}

	.place {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20px;
	}
	.place h2 {
		margin-top: 32px;
		margin-bottom: 0;
		opacity: initial;
		animation: blink 5s;
	}
	.place span {
		margin-bottom: 4px;
	}
	.place ul {
		display: flex;
		gap: 8px;
	}
	.place * {
		opacity: 0;
		animation: appear 2s forwards 1s;
	}

	img {
		width: 20px;
		height: 20px;
	}
</style>
