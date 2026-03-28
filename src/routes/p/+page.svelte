<script lang="ts">
	import { enhance } from "$app/forms";
	import FormInput from "$lib/components/FormInput.svelte";
	import Title from "$lib/components/Title.svelte";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	let p1 = $state("");
	let p2 = $state("");

	$effect(() => {
		p1;
		p2 = "";
	});
</script>

{#if data.user}
	<Title title="Profile" />

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
		<FormInput name="name" value={data.user.name} type="text" autocomplete="username" required />
		<FormInput label="TimeZone" name="tz" value={data.user.tz} type="select">
			{#each Intl.supportedValuesOf("timeZone") as v}
				<option value={v}>{v}</option>
			{/each}
		</FormInput>

		<FormInput label="New Password" name="newPassword" bind:value={p1} type="password" autocomplete="new-password" />
		<FormInput
			label="New Password again"
			name="newPasswordAgain"
			bind:value={p2}
			type="password"
			autocomplete="new-password"
			disabled={!p1.length}
			required
		/>

		<div>
			<button type="submit" formaction="?/edit">Submit</button>
			<button type="submit" formaction="?/logout">Logout</button>
		</div>
	</form>
{/if}
