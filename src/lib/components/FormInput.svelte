<script lang="ts">
	import type { ComponentProps } from "svelte";
	import type { HTMLInputAttributes, HTMLSelectAttributes, HTMLTextareaAttributes } from "svelte/elements";
	import InputDate from "./InputDate.svelte";

	type TI = Omit<HTMLInputAttributes, "value">;
	type TTA = Omit<HTMLTextareaAttributes, "value">;
	type TS = Omit<HTMLSelectAttributes, "value">;

	type THidden = { type: "hidden"; value: string | number | null } & TI;
	type TText = { type: "text" | "password"; value: string } & TI;
	type TNumber = { type: "number"; value: number | null } & TI;
	type TCheckBox = { type: "checkbox"; value: boolean | null } & TI;
	type TDateTime = { type: "datetime" } & ComponentProps<typeof InputDate>;
	type TTextArea = { type: "textarea"; value: string } & TTA;
	type TSelect = { type: "select"; value: number | string | null } & TS;
	type P = THidden | TText | TNumber | TCheckBox | TDateTime | TTextArea | TSelect;
	let { type, name, label, value = $bindable(), children, ...rest }: P & { label?: string; name: string } = $props();
</script>

{#if type == "hidden"}
	{@const r = { ...rest } as TI}
	<input type="hidden" {name} id={rest.id || name} bind:value {...r} />
{:else}
	{@const id = rest.id || name}
	<div>
		<label for={name}>{label || name}</label>
		{#if type == "textarea"}
			{@const r = { ...rest } as TTA}
			<textarea {name} {id} bind:value {...r}></textarea>
		{:else if type == "datetime"}
			{@const r = { ...rest } as any}
			<InputDate {name} bind:value {...r} />
		{:else if type == "select"}
			{@const r = { ...rest } as TS}
			<select {name} {id} bind:value {...r}>
				{@render children?.()}
			</select>
		{:else if type == "checkbox"}
			{@const r = { ...rest } as TI}
			<!-- TODO Label after checkbox -->
			<input type="checkbox" {name} {id} bind:checked={value as TCheckBox["value"]} {...r} />
		{:else}
			{@const r = { ...rest } as TI}
			<input {type} {name} {id} bind:value {...r} />
		{/if}
	</div>
{/if}

<style lang="postcss">
	label {
		text-transform: capitalize;
	}
</style>
