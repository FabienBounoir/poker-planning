<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { fade, scale } from 'svelte/transition';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { quintInOut, quintOut } from 'svelte/easing';
	import { Confetti } from 'svelte-confetti';
	import myshades from '$lib/myshades';
	import type { Socket } from 'socket.io-client';
	import ioClient from 'socket.io-client';

	let roomId = $page.params.id;
	let io: Socket;

	let pokerManager = $state(null);
	let hexcode = $state('');

	let timeout: number | null;
	let interval: number | null;

	let selectedLetter = $state(null);
	let username = $state('');
	let submitting = $state(false);
	let submittedLetter = $state('');

	let resultsItem = $state(null);
	let resultDefender = $state(null);

	let players = $state(null);

	let existingPositions = [];

	onMount(() => {
		if (window.localStorage.getItem('username')) {
			username = window.localStorage.getItem('username');
		}
	});

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}

		if (io) {
			io.disconnect();
			// io.emit('leave-room', { roomId });
		}
	});

	$effect(() => {
		existingPositions = players ? [] : [];
	});

	$effect(() => {
		window.localStorage.setItem('username', username);
	});

	const connect = () => {
		if (username.trim() == '') {
			return toast.info("J'aimerai savoir comment tu t'appelles !");
		}

		try {
			submitting = true;
			io = ioClient(import.meta.env.VITE_BACKEND_URL);

			io.on('connect', () => {
				io.emit('join', { roomId, name: username });
			});

			io.on('game-update', (payload) => {
				console.log('payload', payload);
				resultsItem = null;
				resultDefender = null;

				if (payload.state == 'playing' && payload.state != pokerManager?.state) {
					selectedLetter = null;
					submittedLetter = null;
				} else if (payload?.state == 'result') {
					if (payload?.result) {
						resultsItem = payload.result;
					}

					if (payload?.defender) {
						resultDefender = payload.defender;
					}
				}

				if (pokerManager?.hexcode != payload?.hexcode) {
					myshades({
						primary: payload.hexcode
					});
				}
				pokerManager = payload;
			});

			io.on('success', (payload) => {
				console.log('payload sucess', payload);
				if (payload?.success) {
					if (timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
				}
			});

			io.on('players', (payload) => {
				players = payload;
			});

			io.on('hexcode', (payload) => {
				myshades({
					primary: payload.hexcode
				});
			});

			io.on('error', (e) => {
				console.error('WEBSOCKET ERROR', e);

				if (e.reason == "Room doesn't exist") {
					toast.error("Ce poker planning n'existe pas.");
					goto('/join');
				}
			});

			io.on('reconnect', (attempt) => {
				console.info(`Reconnecté après ${attempt} tentatives.`);
				toast.success('Reconnecté au serveur !');

				io.emit('join', { roomId, name: username });
			});
		} catch (e) {
			console.error('Websocket error', e);
		} finally {
			submitting = false;
		}
	};

	const sendVote = () => {
		timeout = setTimeout(() => {
			toast.error("Une erreur s'est produite lors de l'envoi de votre vote.");
			submittedLetter = null;
			selectedLetter = null;
		}, 2000);

		io.send({ type: 'vote', data: { card: selectedLetter } });
		submittedLetter = selectedLetter;
	};

	const includeUS_ID = (userStory) => {
		const match = userStory.match(/NFS-\d+/i);
		return match ? `https://portail.agir.orange.com/browse/${match[0]}` : false;
	};

	const sendHexa = () => {
		if (hexcode.toLowerCase() == 'random') {
			hexcode = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
			if (hexcode.length < 7) hexcode = hexcode.padEnd(7, '0');
		}

		const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		if (!hexColorRegex.test(hexcode)) {
			return toast.error(`Le code hexa '${hexcode}' n'est pas valide`);
		}

		io.send({ type: 'hexcode', data: { hexcode } });
	};

	const isPositionFree = (top, left) => {
		// Vérifie que la position ne chevauche pas un autre élément existant
		return !existingPositions.some(
			(pos) => Math.abs(pos.top - top) < 10 && Math.abs(pos.left - left) < 10 // Ajuster pour tolérance de chevauchement
		);
	};

	const getRandomPosition = () => {
		let top, left;
		let tries = 0;
		const maxTries = 10; // Nombre maximum de tentatives pour trouver une position libre

		do {
			top = Math.random() < 0.5 ? Math.random() * 20 + 20 : Math.random() * 20 + 60;
			left = Math.random() < 0.5 ? Math.random() * 20 + 20 : Math.random() * 20 + 60;
			tries++;
		} while (!isPositionFree(top, left) && tries < maxTries);

		// Enregistre la position trouvée si elle est libre
		if (tries < maxTries) existingPositions.push({ top, left });

		return `--top: ${top}vh; --left: ${left}vw;`; // transform: scale(1); opacity: 1;
	};
</script>

{#if pokerManager == null}
	<div class="init-page">
		<h1>
			Bienvenue <span class="rotateAnimation">👋</span> <br />Comment tu t'appelles déjà ?<br />
		</h1>
		<form on:submit|preventDefault={connect}>
			<input type="text" bind:value={username} placeholder="Jean Bon" disabled={submitting} />
			<button type="submit" disabled={submitting}>Valider</button>
		</form>
	</div>
{:else}
	<main>
		<form on:submit|preventDefault={sendHexa} style="display: none;">
			<input type="text" bind:value={hexcode} placeholder="#FF00EE" disabled={submitting} />
		</form>

		{#if pokerManager.state === 'waiting'}
			<h3 class="player-count-display">
				{players?.length || 0} player{players?.length > 1 ? 's' : ''}
			</h3>

			<h1>En attente du lancement des votes...</h1>
			{#if players}
				{#each players as player}
					<div
						class="player-display"
						style={getRandomPosition()}
						transition:scale={{ duration: 500 }}
					>
						<img src="https://api.dicebear.com/9.x/dylan/svg?seed={player.name}" />
						<span>{player.name}</span>
					</div>
				{/each}
			{/if}
		{:else if pokerManager.state === 'playing'}
			{#if pokerManager?.userStory}
				<div class="user-story" transition:scale={{ duration: 500 }}>
					<h3>User story</h3>
					{#if includeUS_ID(pokerManager.userStory)}
						<h1>
							<a target="_blank" href={includeUS_ID(pokerManager.userStory)}
								>{pokerManager.userStory}</a
							>
						</h1>
					{:else}
						<h1>{pokerManager.userStory}</h1>
					{/if}
				</div>
			{/if}

			<div class="flex" in:fade={{ duration: 500, easing: quintOut }}>
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
			<div class="result-container" in:fade={{ duration: 700, easing: quintInOut }}>
				<h1>Voici Les Resultats</h1>

				{#if resultDefender}
					{#key resultDefender}
						<h3 transition:scale={{ delay: 2000, duration: 500, easing: quintInOut }}>
							<div>
								<img src="https://api.dicebear.com/9.x/dylan/svg?seed={resultDefender.name}" />
								<span>{resultDefender.name}</span>
							</div>
							Pourquoi as-tu choisi
							<span> {resultDefender.item}</span> ?
						</h3>
					{/key}
				{/if}

				<div class="result" style="--item:{resultsItem?.length > 4 ? 4 : resultsItem?.length}">
					{#if resultsItem}
						{#if resultsItem.length == 1 && resultsItem?.[0]?.[1]?.length > 1}
							<div
								style="
							position: fixed;
							top: -50px;
							left: 0;
							height: 100vh;
							width: 100vw;
							display: flex;
							justify-content: center;
							overflow: hidden;
							pointer-events: none;"
							>
								<Confetti
									x={[-5, 5]}
									y={[0, 0.1]}
									delay={[500, 2000]}
									infinite
									duration="5000"
									amount="200"
									fallDistance="100vh"
								/>
							</div>
						{/if}

						{#each resultsItem as [item, players]}
							<div class="result-item">
								<h1>{item}</h1>
								{#if players?.length}
									{#each players as player}
										<p>{player}</p>
									{/each}
								{:else}
									<p>Aucun Vote</p>
								{/if}
							</div>
						{/each}
					{:else}
						<p class="no-vote">Aucun vote à afficher 🥲</p>
					{/if}
				</div>
			</div>
		{/if}
	</main>
{/if}

<style lang="scss">
	.result-container {
		display: flex;
		flex-direction: column;
		gap: 3em;
		justify-content: center;
		align-items: center;
		padding: 2em 0;

		.no-vote {
			font-size: 1.5em;
			font-weight: 800;
			color: var(--primary-600);
		}

		> h1 {
			font-size: 1.2em;
			// font-weight: 700;
			color: var(--primary-800);
		}

		> h3 {
			font-size: 2em;

			& > div {
				display: flex;
				align-items: center;
				justify-content: center;
			}

			img {
				width: 40px;
				height: 40px;
				margin-right: 12px;
				border-radius: 100%;
				border: 2px solid var(--primary-800);
			}

			span {
				font-weight: 600;
				color: var(--primary-700);
			}
		}

		.result {
			gap: 5dvh;
			display: grid;
			grid-template-columns: repeat(var(--item, 3), 1fr);

			.result-item {
				border: 3px solid var(--primary-600);
				background-color: var(--primary-200);
				display: flex;
				flex-direction: column;
				text-align: center;
				padding: 0.5em 0;
				border-radius: 5px;
				min-width: 18vw;

				h1 {
					font-weight: 900;
					font-size: 3em;
					margin-bottom: 2vh;
					color: var(--primary-600);
				}

				p {
					color: var(--primary-950);
				}
			}
		}
	}

	.init-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;

		.rotateAnimation {
			display: inline-block;
			animation: coucou 1s infinite;

			@keyframes coucou {
				0%,
				100% {
					transform: rotate(0deg);
				}
				50% {
					transform: rotate(20deg);
				}
			}
		}

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
		min-height: 100dvh;
		gap: 5dvh;

		.player-count-display {
			position: fixed;
			transform: translate(-50%, 0);
			padding: 1em;
			top: 0;
			left: 50%;
			color: var(--primary-700);
			font-weight: 800;
			font-size: 1.5em;
			border-radius: 5px;
			background-color: var();
		}

		.player-display {
			position: fixed;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.5em;
			transform: translate(-50%, -50%);
			top: var(--top, 30);
			left: var(--left, 50);

			img {
				border-radius: 100%;
				border: 2px solid var(--primary-700);
				width: 50px;
				height: 50px;
			}
		}

		button:disabled {
			opacity: 0.5;
			cursor: not-allowed;
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
				width: 80%;
			}
		}
	}
</style>
