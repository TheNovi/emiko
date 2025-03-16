<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let user = $state(data.user);
	let p1 = $state('');
	let p2 = $state('');

	$effect(() => {
		if (!p1.length) p2 = '';
	});
</script>

<form method="post">
	<div>
		<label for="id">id</label>
		<input disabled type="number" name="id" id="id" bind:value={user.id} />
	</div>

	<div>
		<label for="name">name</label>
		<input type="text" name="name" id="name" required bind:value={user.name} />
	</div>

	<div>
		<label for="newPassword">New Password</label>
		<input type="password" name="newPassword" id="newPassword" bind:value={p1} />
	</div>
	{#if p1.length}
		<div>
			<label for="password">New Password again</label>
			<input
				type="password"
				name="newPasswordAgain"
				id="newPasswordAgain"
				required
				bind:value={p2}
			/>
		</div>
	{/if}

	<div>
		<button disabled={!(user.name !== data.user.name || (p1.length && p1 === p2))} type="submit">
			Submit
		</button>
	</div>
</form>
