<script lang="ts">
	import { enhance } from "$app/forms";
	import FormInput from "$lib/components/FormInput.svelte";
	import Title from "$lib/components/Title.svelte";
	import type { PageProps } from "./$types";

	let { form }: PageProps = $props();
	let name = $state("");
	let password = $state("");
</script>

<Title title="Login" />

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
	<FormInput name="name" value={name} type="text" autocomplete="username" required />
	<FormInput name="password" value={password} type="password" autocomplete="current-password" required />
	<div>
		<button type="submit">Login</button>
	</div>
</form>
