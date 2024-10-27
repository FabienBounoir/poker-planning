<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { scale } from 'svelte/transition';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let roomId = $page.params.id;

	let pokerManager = $state(null);

	let ws;

	let timeout: number | null;

	let selectedLetter = $state(null);
	let username = $state('');
	let submitting = $state(false);
	let submittedLetter = $state('');

	const connect = () => {
		if (username.trim() == '') {
			return toast.error("J'aimerai savoir comment tu t'appelles");
		}

		try {
			submitting = true;
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			ws = new WebSocket(
				`${protocol}//${window.location.host}/websocket?${new URLSearchParams({
					roomId,
					username
				})}`
			);

			ws.onmessage = (e) => {
				const payload = JSON.parse(e.data);
				console.log('Event Payload', payload);

				switch (payload.type) {
					case 'game-update':
						if (payload.data.state == 'playing' && payload.data.state != pokerManager?.state) {
							selectedLetter = null;
						}
						pokerManager = payload.data;
						break;
					case 'success':
						if (payload?.success) {
							if (timeout) {
								clearTimeout(timeout);
								timeout = null;
							}
						}
						break;
				}
			};

			ws.onclose = (e) => {
				if (e.reason == "Room doesn't exist") {
					toast.error("This Rooms doesn't exist");
					goto('/join');
				}
			};
		} catch (e) {
			console.error('Websocket error', e);
		} finally {
			submitting = false;
		}
	};

	const sendVote = () => {
		timeout = setTimeout(() => {
			toast.error('Error when send your vote');
			submittedLetter = null;
			selectedLetter = null;
		}, 2000);

		ws.send(JSON.stringify({ type: 'vote', data: { card: selectedLetter } }));
		submittedLetter = selectedLetter;
	};

	const includeUS_ID = (userStory) => {
		const match = userStory.match(/NFS-\d+/i);
		return match ? `https://portail.agir.orange.com/browse/${match[0]}` : false;
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
			<p>En attente du lancement des votes</p>
		{:else if pokerManager.state === 'playing'}
			{#if pokerManager?.userStory}
				<div class="user-story" transition:scale={{ duration: 500 }}>
					<h3>User story</h3>
					{#if includeUS_ID(pokerManager.userStory)}
						<h1><a href={includeUS_ID(pokerManager.userStory)}>{pokerManager.userStory}</a></h1>
					{:else}
						<h1>{pokerManager.userStory}</h1>
					{/if}
				</div>
			{/if}

			<div class="flex">
				{#each pokerManager.cards as card}
					<Card content={card} bind:cardSelected={selectedLetter} bind:submittedLetter />
				{/each}
			</div>

			<button
				class:hidden={selectedLetter === null}
				disabled={submittedLetter != null && selectedLetter == submittedLetter}
				on:click={() => {
					sendVote();
				}}
			>
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

		button:disabled {
			opacity: 0.5;
		}

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

		.flex {
			display: flex;
			gap: 2vw;
			flex-wrap: wrap;
			justify-content: center;

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

	@media screen and (max-width: 500px) {
		main {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: auto;
			gap: 3em;
			padding: 3em 0 0 0;
			text-align: center;

			.flex {
				display: flex;
				flex-direction: column;
				gap: 1em;
				flex-wrap: wrap;
				justify-content: center;

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

			button {
				position: sticky;
				bottom: 1em;
			}
		}
	}
</style>
