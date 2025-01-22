<script>
	import { _ } from 'svelte-i18n';

	let {
		value = $bindable(),
		minRows = 3,
		maxRows = 3,
		disabled = true,
		placeholder = ''
	} = $props();

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

	<textarea id="userStory" disabled={!disabled} bind:value placeholder={$_(placeholder)}></textarea>
</div>

<style lang="scss">
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
		max-width: 40vw;

		&:disabled {
			cursor: not-allowed;
			filter: grayscale(0.8);
			border-color: var(--primary-500);
		}
	}

	textarea {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		resize: none;
	}

	@media screen and (max-width: 950px) {
		pre,
		textarea {
			max-width: 95vw;
		}
	}

	@media (prefers-color-scheme: dark) {
		textarea {
			background-color: var(--primary-800);
			color: var(--primary-50);
			border-color: var(--primary-950);
		}

		pre {
			border: none;
		}
	}
</style>
