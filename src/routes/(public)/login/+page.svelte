<script lang="ts">
	import { dev } from "$app/environment";
	import { enhance } from "$app/forms";
	import Header from "$lib/components/Header.svelte";
	import type { PageProps } from "./$types";

	let { form }: PageProps = $props();
	let name = $state("");
	let password = $state("");
	if (dev) name = password = "admin";
</script>

<Header title="Login" />

<form
	method="post"
	use:enhance={({}) => {
		return async ({ update }) => {
			password = "";
			update({ reset: false });
		};
	}}
>
	{#each form?.errors || [] as e (e)}
		<div class="error">{e}</div>
	{/each}
	<div>
		<label for="name">name</label>
		<input type="text" autocomplete="username" name="name" id="name" required value={form?.name || name} />
	</div>

	<div>
		<label for="password">Password</label>
		<input type="password" autocomplete="current-password" name="password" id="password" required value={password} />
	</div>

	<div>
		<button type="submit">Login</button>
	</div>
</form>

<style lang="postcss">
	.error {
		color: red;
	}
</style>
