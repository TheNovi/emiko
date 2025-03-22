<script lang="ts">
	import { enhance } from "$app/forms";
	import Header from "$lib/components/Header.svelte";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	let p1 = $state("");
	let p2 = $state("");

	$effect(() => {
		p1;
		p2 = "";
	});
</script>

<Header title="Profile" />

<!-- TODO As multiple forms -->
<form
	method="post"
	use:enhance={({}) => {
		return async ({ update }) => {
			p1 = "";
			update({ reset: false });
		};
	}}
>
	{#each form?.errors || [] as e (e)}
		<div class="error">{e}</div>
	{/each}
	<div>
		<label for="name">name</label>
		<input type="text" name="name" id="name" required value={form?.name ?? data.user.name} />
	</div>

	<div>
		<label for="newPassword">New Password</label>
		<input type="password" autocomplete="new-password" name="newPassword" id="newPassword" bind:value={p1} />
	</div>
	<div>
		<label for="password">New Password again</label>
		<input type="password" autocomplete="new-password" name="newPasswordAgain" id="newPasswordAgain" disabled={!p1.length} required bind:value={p2} />
	</div>

	<div>
		<button type="submit">Submit</button>
	</div>
</form>

<style lang="postcss">
	.error {
		color: red;
	}
</style>
