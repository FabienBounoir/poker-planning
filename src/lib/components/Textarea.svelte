<script>
	let { value = $bindable(), minRows = 3, maxRows = 3 } = $props();

	let minHeight = $state(`${1 + minRows * 1.2}em`);
	let maxHeight = $state(`${1 + maxRows * 1.2}em`);

	$effect(() => {
		minHeight = `${1 + minRows * 1.2}em`;
	});

	$effect(() => {
		maxHeight = maxRows ? `${1 + maxRows * 1.2}em` : `auto`;
	});
</script>

<div class="container">
	<pre aria-hidden="true" style="min-height: {minHeight}; max-height: {maxHeight}">{value +
			'\n'}</pre>

	<textarea bind:value></textarea>
</div>

<style>
	.container {
		position: relative;
	}

	pre,
	textarea {
		font-family: inherit;
		padding: 0.5em;
		box-sizing: border-box;
		border: 1px solid #eee;
		line-height: 1.2;
		overflow: hidden;
		width: 100%;
	}

	textarea {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		resize: none;
	}
</style>
