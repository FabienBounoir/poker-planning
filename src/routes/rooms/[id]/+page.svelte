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

	let roomId = $page.params.id;

	let pokerManager = $state(null);
	let hexcode = $state('');

	let ws;

	let timeout: number | null;

	let selectedLetter = $state(null);
	let username = $state('');
	let submitting = $state(false);
	let submittedLetter = $state('');

	let resultsItem = $state(null);
	let resultDefender = $state(null);

	onMount(() => {
		if (window.localStorage.getItem('username')) {
			username = window.localStorage.getItem('username');
		}
	});

	onDestroy(() => {
		if (ws) {
			ws.close();
		}
	});

	$effect(() => {
		console.log('username update');
		window.localStorage.setItem('username', username);
	});

	const connect = () => {
		if (username.trim() == '') {
			return toast.info("J'aimerai savoir comment tu t'appelles !");
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
						resultsItem = null;
						resultDefender = null;

						if (payload.data.state == 'playing' && payload.data.state != pokerManager?.state) {
							selectedLetter = null;
							submittedLetter = null;
						} else if (payload?.data?.state == 'result') {
							if (payload?.data?.result) {
								resultsItem = payload.data.result;
							}

							if (payload?.data?.defender) {
								resultDefender = payload.data.defender;
							}
						}

						if (pokerManager?.hexcode != payload?.data?.hexcode) {
							myshades({
								primary: payload.data.hexcode
							});
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

					case 'hexcode':
						myshades({
							primary: payload.data.hexcode
						});
						break;
				}
			};

			ws.onclose = (e) => {
				if (e.reason == "Room doesn't exist") {
					toast.error("Ce poker planning n'existe pas.");
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
			toast.error("Une erreur s'est produite lors de l'envoi de votre vote.");
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

	const sendHexa = () => {
		if (hexcode.toLowerCase() == 'random') {
			hexcode = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
			if (hexcode.length < 7) hexcode = hexcode.padEnd(7, '0');
		}

		const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		if (!hexColorRegex.test(hexcode)) {
			return toast.error(`Le code hexa '${hexcode}' n'est pas valide`);
		}

		ws.send(JSON.stringify({ type: 'hexcode', data: { hexcode } }));
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
			<h1>En attente du lancement des votes...</h1>
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
