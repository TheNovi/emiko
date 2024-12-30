<script lang="ts">
	import { dev } from '$app/environment';

	//TODO Form errors
	let name = $state('');
	let password = $state('');
	if (dev) name = password = 'admin';
</script>

<form method="post">
	<div>
		<label for="name">name</label>
		<input type="text" autocomplete="username" name="name" id="name" required bind:value={name} />
	</div>

	<div>
		<label for="password">Password</label>
		<input
			type="password"
			autocomplete="current-password"
			name="password"
			id="password"
			required
			bind:value={password}
		/>
	</div>

	<div>
		<button type="submit">Login</button>
	</div>
</form>
