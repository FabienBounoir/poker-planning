<script>
	let { value = $bindable(false), fontSize = 16, label } = $props();

	let checked = $state(false);

	const uniqueID = Math.floor(Math.random() * 100);

	/**
	 * Event handler function.
	 *
	 * @param {Event} event - The event object.
	 */
	function handleClick(event) {
		const target = event.target;
		const state = target.getAttribute('aria-checked');

		updateState(state);
	}

	function updateState(state) {
		checked = state === 'true' ? false : true;

		value = state === 'false';
	}

	$effect(() => {
		updateState(value ? 'false' : 'true');
	});
</script>

<div class="s slider" style="font-size:{fontSize}px">
	<span id={`switch-${uniqueID}`}>{label}</span>
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-labelledby={`switch-${uniqueID}`}
		on:click={handleClick}
	>
	</button>
</div>

<style lang="scss">
	button {
		outline: none;

		&:focus-visible {
			outline: 2px solid var(--primary-400);
		}
	}

	.slider {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.slider button {
		width: 3em;
		height: 1.6em;
		position: relative;
		margin: 0 0 0 0.5em;
		background: var(--primary-200);
		border: none;
	}

	.slider button::before {
		content: '';
		position: absolute;
		width: 1.3em;
		height: 1.3em;
		background: #fff;
		top: 0.13em;
		right: 1.5em;
		transition: transform 0.3s;
	}

	.slider button[aria-checked='true'] {
		background-color: var(--primary-600);
	}

	.slider button[aria-checked='true']::before {
		transform: translateX(1.3em);
		transition: transform 0.3s;
	}

	.slider button {
		border-radius: 1.5em;
	}

	.slider button::before {
		border-radius: 100%;
	}

	.slider button:focus {
		border-radius: 1.5em;
	}

	@media (prefers-color-scheme: dark) {
		.slider button {
			background: var(--primary-400);
		}

		span {
			color: var(--primary-100);
		}
	}
</style>
