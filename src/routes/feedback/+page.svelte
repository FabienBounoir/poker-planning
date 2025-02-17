<script>
	import Textarea from '$lib/components/Textarea.svelte';
	import { toast } from 'svelte-sonner';
	import { quintOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	let step = $state('feedback');
	let feedback = $state('');
	let feeling = $state('neutral');
	let email = $state('');

	const sendFeedback = () => {
		if (!validEmail(email)) {
			toast.error($_('feedback.errorInvalidEmail'));
			return;
		}

		fetch(`${import.meta.env.VITE_BACKEND_URL}/feedback`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				feeling,
				feedback,
				email
			})
		});

		step = 'thankyou';
	};

	const validEmail = (email) => {
		const re = /\S+@\S+\.\S+/;
		return re.test(email);
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
		<h1>{$_('feedback.headerFeedback')}</h1>
		<p>{$_('feedback.paragraphFeedback')}</p>
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

			<input type="text" placeholder={$_('feedback.placeholderEmail')} bind:value={email} />
			<Textarea
				bind:value={feedback}
				minRows={3}
				maxRows={10}
				placeholder={$_('feedback.placeholderComment')}
			/>

			<button type="submit" disabled={!feedback || !email}
				>{$_('feedback.buttonSendFeedback')}</button
			>
		</form>
	</main>
{:else}
	<main in:scale={{ duration: 300, easing: quintOut }}>
		<h1>{$_('feedback.headerThankYou')}</h1>
		<p>{$_('feedback.paragraphThankYou')}</p>

		<a href="/" title={$_('feedback.buttonBackHome')}>{$_('feedback.buttonBackHome')}</a>
	</main>
{/if}

<style lang="scss">
	p {
		color: var(--primary-800);
		text-wrap: balance;
		width: min(100%, 40ch);
	}

	a {
		margin-top: 1em;
		cursor: pointer;

		border: none;

		background-color: var(--primary-500);
		color: var(--primary-950);
		font-weight: 600;

		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;

		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;

		outline-color: var(--primary-200);
		text-align: center;

		transition-property: outline-width, opacity;

		text-decoration: none;

		transition: scale 0.3s !important;

		&:hover {
			scale: 1.05;
		}
		font-weight: bold;
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

		p {
			color: var(--primary-100);
		}

		input {
			background-color: var(--primary-800);
			color: var(--primary-100);
		}
	}
</style>
