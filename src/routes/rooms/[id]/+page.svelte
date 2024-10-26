<script>
	import Card from '$lib/components/Card.svelte';
	import { scale } from 'svelte/transition';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';

	let roomId = $page.params.id;

	let pokerManager = $state(null);

	let pokerManagere = {
		cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
		state: 'playing',
		userStory: 'Faire un planning poker'
	};

	let selectedLetter = $state(null);
	let username = $state('');
	let submitting = $state(false);

	const connect = () => {
		if (username.trim() == '') {
			return toast.error("J'aimerai savoir comment tu t'appelles");
		}

		try {
			submitting = true;
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const ws = new WebSocket(
				`${protocol}//${window.location.host}/websocket?${new URLSearchParams({
					roomId,
					username
				})}`
			);

			pokerManager = pokerManagere;
		} catch (e) {
			console.error('Websocket error', e);
		} finally {
			submitting = false;
		}
	};
</script>

{#if pokerManager == null}
	<div class="init-page">
		<h1>Bienvenue, <br />Comment tu t'appelles déjà ?<br /></h1>
		<form on:submit|preventDefault={connect}>
			<input type="text" bind:value={username} placeholder="Jean Bon" disabled={submitting} />
			<button type="submit" disabled={submitting}>Valider</button>
		</form>
	</div>
{:else}
	<main>
		{#if pokerManager.state === 'waiting'}
			<p>En attente de joueurs</p>
		{:else if pokerManager.state === 'playing'}
			{#if pokerManager?.userStory}
				<div class="user-story" transition:scale={{ duration: 500 }}>
					<h3>User story</h3>
					<h1>{pokerManager.userStory}</h1>
				</div>
			{/if}

			<div class="grid">
				{#each pokerManager.cards as card}
					<Card content={card} bind:cardSelected={selectedLetter} />
				{/each}
			</div>

			<button class:hidden={selectedLetter === null}>
				Je pense que c'est {selectedLetter}
			</button>
		{:else if pokerManager.state === 'result'}
			<h1>OMG les resultats</h1>
		{/if}
	</main>
{/if}

<style lang="scss">
	.init-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;

		h1 {
			font-weight: 900;
			font-size: 2em;
			padding-bottom: 1em;
			color: var(--primary-800);
		}

		form {
			display: grid;
			gap: 0.5em;

			input {
				text-align: center;
			}
		}
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100dvh;
		gap: 5dvh;

		.user-story {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 0.5em;
			color: var(--primary-950);

			h1 {
				font-size: 2em;
			}

			h3 {
				color: var(--primary-700);
			}
		}

		.grid {
			display: flex;
			gap: 2vw;
			flex-wrap: wrap;
			justify-content: center;

			//je veux que les autre enfant soit grisé lorsque j'hover sur un enfant
			& > * {
				transition: filter 0.3s;
			}

			& > *:hover {
				/* Annule le grisage pour la carte survolée */
				filter: none;
				background-color: red !important;
			}

			& > *:not(:hover) {
				/* Grise les autres cartes */
				filter: grayscale(1) !important;
				pointer-events: none; /* Empêche les autres cartes d'être sélectionnées lors du survol */
			}
		}

		.hidden {
			visibility: hidden;
		}
	}
</style>
