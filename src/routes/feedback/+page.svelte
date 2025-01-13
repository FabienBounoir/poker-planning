<script>
	import Textarea from '$lib/components/Textarea.svelte';
	import { quintOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	let step = $state('feedback');
	let feedback = $state('');
	let feeling = $state('neutral');

	const sendFeedback = () => {
		console.log(feedback);
		step = 'thankyou';

		setTimeout(() => {
			step = 'feedback';
		}, 3000);
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

{#if step === 'feedback'}
	<main in:scale={{ duration: 300, easing: quintOut }}>
		<h1>How are your feeling?</h1>
		<p>
			Your input is valuable in helping us better understand your needs and tailor our service
			accordingly
		</p>
		<form on:submit|preventDefault={sendFeedback}>
			<div class="feeling">
				<input type="radio" id="angry" name="feeling" value="angry" bind:group={feeling} />
				<label for="angry">😡</label>

				<input type="radio" id="sad" name="feeling" value="sad" bind:group={feeling} />
				<label for="sad">😔</label>

				<input type="radio" id="neutral" name="feeling" value="neutral" bind:group={feeling} />
				<label for="neutral">😐</label>

				<input type="radio" id="happy" name="feeling" value="happy" bind:group={feeling} />
				<label for="happy">🙂</label>

				<input type="radio" id="loving" name="feeling" value="loving" bind:group={feeling} />
				<label for="loving">🥰</label>
			</div>

			<input type="text" placeholder="Your Email" />
			<Textarea bind:value={feedback} minRows={3} maxRows={10} placeholder="Add a comment..." />

			<button type="submit">Send Feedback</button>
		</form>
	</main>
{:else}
	<main in:scale={{ duration: 300, easing: quintOut }}>
		<h1>Thank you for your feedback!</h1>
		<p>We appreciate your time and effort in helping us improve our service</p>
	</main>
{/if}

<style lang="scss">
	p {
		color: var(--primary-800);
		text-wrap: balance;
		width: min(100%, 40ch);
	}
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
			margin: 1em 0;

			input {
				display: none;
			}

			label {
				aspect-ratio: 1;
				cursor: pointer;
				font-size: 2em;
				border-radius: 50%;
				background-color: var(--primary-300);
				width: 1.5em;
				height: 1.5em;
				align-items: center;
				justify-content: center;
				display: inline-flex;
				vertical-align: middle;
				transform: filter 0.3s;
			}

			:not(input:checked) + label:hover {
				filter: grayscale(0.2) !important;
			}

			input:checked + label {
				background: linear-gradient(-180deg, var(--primary-700), var(--primary-400));
				border-radius: 50%;
				padding: 0.5em;
				color: white;
				width: 1.8em;
				height: 1.8em;
				transform: scale(1.1);
			}

			:not(input:checked) + label {
				filter: grayscale(1);
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
