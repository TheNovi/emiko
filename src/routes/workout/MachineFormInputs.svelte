<script lang="ts">
	import FormInput from "$lib/components/FormInput.svelte";
	import type { WoMachine } from "$lib/server/workout";

	let { machine, prefix }: { machine: WoMachine; prefix?: string } = $props();
</script>

<FormInput type="hidden" name="id" value={machine.id} />
Machine {machine.id}
<FormInput name="name" value={machine.name} type="text" />
<!-- TODO Tags as inline buttons (just visually) -->
<FormInput name="cardio" value={machine.cardio} type="checkbox" />
<FormInput name="hands" value={machine.hands} type="checkbox" />
<FormInput name="legs" value={machine.legs} type="checkbox" />
<FormInput name="belly" value={machine.belly} type="checkbox" />
<FormInput name="push" value={machine.push} type="checkbox" />
<FormInput name="pull" value={machine.pull} type="checkbox" />
<FormInput name="other" value={machine.other} type="checkbox" />
<FormInput name="reps" value={machine.reps} type="number" min="0" />
<FormInput name="sets" value={machine.sets} type="number" min="0" />
<FormInput name="value" value={machine.value} type="number" step="0.1" min="0" />
<FormInput name="unit" value={machine.unit} type="text" />
<FormInput name="text" value={machine.text} type="textarea" />
