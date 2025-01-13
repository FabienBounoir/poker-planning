<script>
	import Textarea from '$lib/components/Textarea.svelte';
	import { quintOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	let feedback = $state('');
	let feeling = $state('');

	const sendFeedback = () => {
		console.log(feedback);
	};
</script>

<svelte:head>
	<title>Feedback - Another Planning Poker</title>
	<meta
		name="description"
		content="Create a new room for your team to start a planning poker session"
	/>
	<meta
		name="og:description"
		content="Create a new room for your team to start a planning poker session"
	/>
	<meta
		name="twitter:description"
		content="Create a new room for your team to start a planning poker session"
	/>
</svelte:head>

<main in:scale={{ duration: 300, easing: quintOut }}>
	<h1>How are your feeling?</h1>
	<p>
		Your input is valuable in helping us better understand your needs and tailor our service
		accordingly
	</p>
	<form on:submit|preventDefault={sendFeedback}>
		<div class="feeling">
			<input type="radio" id="happy" name="feeling" value="happy" bind:group={feeling} />
			<label for="happy">😊</label>

			<input type="radio" id="neutral" name="feeling" value="neutral" bind:group={feeling} />
			<label for="neutral">😐</label>

			<input type="radio" id="sad" name="feeling" value="sad" bind:group={feeling} />
			<label for="sad">😢</label>

			<input type="radio" id="angry" name="feeling" value="angry" bind:group={feeling} />
			<label for="angry">😡</label>
		</div>
		{feeling}

		<input type="text" placeholder="Your Email" />
		<Textarea bind:value={feedback} minRows={3} maxRows={10} />
	</form>
</main>

<style lang="scss">
	form {
		display: grid;
		gap: 0.5em;

		> button {
			margin-top: 1em;
		}

		.feeling {
			display: flex;
			gap: 0.5em;
			align-items: center;
			justify-content: center;

			input {
				display: none;
			}

			label {
				cursor: pointer;
				font-size: 2em;
			}
		}
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		text-align: center;
		scale: 0;
		animation: scale 0.5s forwards 0.2s;

		.animateJoker {
			display: inline-block;
			animation: scaleShake 1s infinite;

			@keyframes scaleShake {
				0% {
					transform: scale(1) rotate(0deg);
				}
				25% {
					transform: scale(1.2) rotate(15deg);
				}
				50% {
					transform: scale(1) rotate(-15deg);
				}
				75% {
					transform: scale(1.2) rotate(10deg);
				}
				100% {
					transform: scale(1) rotate(0deg);
				}
			}
		}

		@keyframes scale {
			0% {
				scale: 0;
			}

			100% {
				scale: 1;
			}
		}
	}

	h1 {
		font-weight: 900;
		font-size: 2em;
		padding-bottom: 1em;
		color: var(--primary-800);
	}

	@media (prefers-color-scheme: dark) {
		h1 {
			color: var(--primary-100);
		}

		.create-new-set {
			label {
				color: var(--primary-100);
			}

			.card {
				p {
					color: var(--primary-800);
				}
			}
		}

		.advance-setting-button {
			&:hover {
				p {
					background-color: var(--primary-800) !important;
				}
			}
			svg {
				stroke: var(--primary-100) !important;
			}
		}

		p {
			color: var(--primary-100);
		}

		input {
			background-color: var(--primary-800);
			color: var(--primary-100);
		}

		select {
			background-color: var(--primary-800);
			color: var(--primary-100);
		}
	}
</style>
