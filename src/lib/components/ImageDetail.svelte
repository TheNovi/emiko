<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { clickedOutsideOfNode } from "$lib/directives.svelte";

	type Image = {
		id: number;
		favorite: boolean;
		public: boolean;
		description: string;
		takenAt: Date;
	};

	let img: Image | undefined = $state();
	let loading: boolean = $state(false);
	let tmpDescr = $state("");

	let { pub, close }: { pub: boolean; close?: () => any } = $props();

	export function openImageDetail(id: number) {
		loading = true;
		let q = new URL(`/bob/f/${id}/desc`, page.url);
		if (pub) q.searchParams.append("public", "true"); //This filters out private images if user IS logged in
		//TODO Error
		fetch(q)
			.then((r) => r.json())
			.then((r: Image) => {
				img = r;
				tmpDescr = r.description;
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
				<div id="l">
					<img src={"/bob/f/" + img.id} alt={img.id + ""} />
				</div>
				{#if pub}
					<div id="r">{@render right(img)}</div>
				{:else}
					<form
						id="r"
						method="POST"
						use:enhance={({ formData, cancel }) => {
							if (!img) return cancel();
							console.log(formData.get("description"), img.description);
							if (formData.get("description") == img.description) formData.delete("description");
							// formData.set("path", "exploit"); //Debug
							// console.log(Object.fromEntries(formData));
							return async ({ update, result }) => {
								if (!img) return;
								if (result.status == 200) {
									img.public = formData.get("public") == "on";
									img.favorite = formData.get("favorite") == "on";
									img.description = tmpDescr || "";
								}
								update({ reset: false });
							};
						}}
					>
						{#each page.form?.errors || [] as e (e)}
							<div class="error">{e}</div>
						{/each}
						<input type="hidden" name="id" id="id" value={img.id} />
						<section>
							<label for="public">Public:</label>
							<input type="checkbox" name="public" id="public" checked={img.public} />
						</section>
						<section>
							<label for="favorite">Favorite:</label>
							<!--  onchange={(e) => patch({ favorite: (e.target as HTMLInputElement)?.checked })}-->
							<input type="checkbox" name="favorite" id="favorite" checked={img.favorite} />
						</section>
						{@render right(img)}
					</form>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#snippet right(img: Image)}
	<!-- Not public fields are above -->
	<section>
		<label for="takenAt">Taken At:</label>
		{new Date(img.takenAt).toLocaleString()}
		<!-- {img.takenAt} -->
		<!-- TODO Copy from tod -->
		<!-- <input type="datetime-local" name="takenAt" id="takenAt" required max={new Date().toJSON()} value={img.takenAt} onchange={() => console.log("asd")} /> -->
	</section>
	<section>
		<textarea name="description" id="description" placeholder="description" readonly={pub} bind:value={tmpDescr}></textarea>
	</section>
	{#if !pub}
		<button type="submit">Save</button>
	{/if}
	<button type="button" onclick={() => hideImageDetail()}>Close</button>
{/snippet}

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

	textarea {
		width: 100%;
		height: fit-content;
		min-height: 50px;
		max-height: 50%;
		resize: vertical;
		background-color: transparent;
		border: none;
		color: inherit;
	}
	textarea::placeholder {
		color: #ddd;
	}
	textarea:read-only:focus {
		outline: none;
	}
	textarea:read-only {
		cursor: default;
	}

	/* .wrap {
		text-wrap: wrap;
	} */
</style>
