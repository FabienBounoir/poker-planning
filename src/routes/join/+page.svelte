<script lang="ts">
	import { goto } from '$app/navigation';
	import { dataToShortBinary } from '$lib/utils';
	import { _ } from 'svelte-i18n';
	import { toast } from 'svelte-sonner';

	let roomId = $state('');
	let submitting = $state(false);

	const join = async () => {
		submitting = true;

		const myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/json');

		const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room?roomId=${roomId}`, {
			method: 'GET',
			headers: myHeaders
		})
			.then((response) => response.json())
			.catch((error) => console.error(error));

		if (res && res.roomId) {
			return goto(`/rooms/${dataToShortBinary(res)}`);
		}

		toast.error($_('JoinPage.roomDoesntExist'));

		submitting = false;
	};

	function handleInput(event: InputEvent) {
		const input = event.target as HTMLInputElement;
		const cursorPosition = input.selectionStart;
		const originalValue = input.value;

		let value = originalValue.replace(/[^A-Za-z0-9]/g, '');

		if (value.length > 3) {
			value = value.slice(0, 3) + '-' + value.slice(3, 6);
		}

		input.value = value;

		const adjustment = value.length - originalValue.length;

		const newCursorPosition = Math.min((cursorPosition ?? 0) + adjustment, value.length);
		input.setSelectionRange(newCursorPosition, newCursorPosition);

		roomId = value;
	}
</script>

<svelte:head>
	<title>{$_('JoinPage.windowsTitle')} - Another Planning Poker</title>
	<meta
		name="description"
		content="Join your team's poker planning session with ease with Another Planning Poker."
	/>
	<meta
		name="og:description"
		content="Join your team's poker planning session with ease with Another Planning Poker."
	/>
	<meta
		name="twitter:description"
		content="Join your team's poker planning session with ease with Another Planning Poker."
	/>
</svelte:head>

<main>
	<h1>
		Hummm <span class="animateDetective">🕵️</span>,<br />{$_('JoinPage.title')}
	</h1>
	<form on:submit|preventDefault={join}>
		<input
			type="text"
			bind:value={roomId}
			on:input={handleInput}
			placeholder="XXX-XXX"
			disabled={submitting}
		/>
		<button
			class:button--loading={submitting}
			aria-label="Rejoindre un poker planning"
			type="submit"
			disabled={submitting}
		>
			<span class="button__text">
				{$_('JoinPage.joinButton')}
			</span>
		</button>
		<a href="/create" title={$_('CreatePage.title')}>{$_('JoinPage.noCodeLink')}</a>
	</form>
</main>

<style lang="scss">
	button {
		position: relative;
	}

	form {
		display: grid;
		gap: 0.5em;

		a {
			text-align: center;
			font-size: 0.8em;
			text-decoration: none;

			&:hover {
				cursor: pointer;
				text-decoration: underline;
			}
		}

		input {
			text-align: center;
		}
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100dvh;
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
		color: var(--primary-950);

		.animateDetective {
			display: inline-block;
			animation: bounceRotate 2s infinite;

			@keyframes bounceRotate {
				0% {
					transform: translateY(0) rotate(0deg); /* Position initiale */
				}
				25% {
					transform: translateY(-10px) rotate(5deg); /* Légère élévation et rotation vers la droite */
				}
				50% {
					transform: translateY(0) rotate(-5deg); /* Retour à la position normale avec rotation vers la gauche */
				}
				75% {
					transform: translateY(2px) rotate(4deg); /* Élément un peu plus bas avec rotation vers la droite */
				}
				100% {
					transform: translateY(0) rotate(0deg); /* Retour à la position initiale */
				}
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		main {
			h1 {
				color: var(--primary-200);
			}
		}

		input {
			background-color: var(--primary-800);
			color: var(--primary-200);
			border: 1px solid var(--primary-500);
		}

		button {
			span {
				color: var(--primary-950);
			}
		}

		a {
			color: var(--primary-200);
		}
	}
</style>
