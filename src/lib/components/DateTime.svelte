<script lang="ts">
	let { name, value, ...props }: { name: string; value?: Date | null } = $props();

	let v = $derived(value ? parseDate(value) : undefined);

	function parseDate(d: Date) {
		return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
		// return d.toISOString().slice(0, -1);
	}
</script>

<!-- TODO Try to bind value and make it utc (using get+set?) -->
<input type="datetime-local" {name} id={name} value={v} {...props} />
<!-- <input type="text" {name} id={name} value={v} {...props} /> -->
