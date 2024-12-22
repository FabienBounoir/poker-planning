<script>
	let { value = $bindable(false), fontSize = 16, label } = $props();

	let checked = $state(false);

	const uniqueID = Math.floor(Math.random() * 100);

	function handleClick(event) {
		const target = event.target;

		const state = target.getAttribute('aria-checked');

		checked = state === 'true' ? false : true;

		value = state === 'false';
	}
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

<style>
	button {
		outline: none;
	}

	/* Slider Design Option */
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

	/* Multi Design Option */
	.s--multi .group-container {
		border: none;
		padding: 0;
		white-space: nowrap;
	}

	.s--multi label {
		display: inline-block;
		line-height: 1.6;
		position: relative;
		z-index: 2;
	}

	.s--multi input {
		opacity: 0;
		position: absolute;
	}

	.s--multi label:first-of-type {
		padding-right: 5em;
	}

	.s--multi label:last-child {
		margin-left: -5em;
		padding-left: 5em;
	}

	.s--multi:focus-within label:first-of-type:after {
		border-radius: 1.5em;
	}

	/* making the switch UI.  */
	.s--multi label:first-of-type:before,
	.s--multi label:first-of-type:after {
		content: '';
		height: 1.25em;
		overflow: hidden;
		pointer-events: none;
		position: absolute;
		vertical-align: middle;
	}

	.s--multi label:first-of-type:before {
		border-radius: 100%;
		z-index: 2;
		position: absolute;
		width: 1.2em;
		height: 1.2em;
		background: #fff;
		top: 0.2em;
		right: 1.2em;
		transition: transform 0.3s;
	}

	.s--multi label:first-of-type:after {
		background: var(--primary-600);
		border-radius: 1em;
		margin: 0 1em;
		transition: background 0.2s ease-in-out;
		width: 3em;
		height: 1.6em;
	}

	.s--multi input:first-of-type:checked ~ label:first-of-type:after {
		background: var(--primary-200);
	}

	.s--multi input:first-of-type:checked ~ label:first-of-type:before {
		transform: translateX(-1.4em);
	}

	.s--multi input:last-of-type:checked ~ label:last-of-type {
		z-index: 1;
	}

	.s--multi input:focus {
		border-radius: 1.5em;
	}

	/* gravy */

	/* Inner Design Option */
	[role='switch'][aria-checked='true'] :first-child,
	[role='switch'][aria-checked='false'] :last-child {
		border-radius: 0.25em;
		background: var(--primary-600);
		display: inline-block;
	}

	.s--inner button:focus {
		border-radius: 0.1em;
	}

	/* Slider Design Option */
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
