<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Code from '$lib/components/Code.svelte';
	import TextArea from '$lib/components/Textarea.svelte';
	import myshades from '$lib/myshades';
	import { io } from '$lib/webSocketConnection';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { backOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	let roomId = $page.params.id;
	let url = $state('');

	let ws: WebSocket;
	let interval: number | null;

	let pokerManager = $state({
		team: '',
		cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
		state: 'waiting',
		userStory: ''
	});

	let users = $state([]);

	const canStarVote = () => {
		if (pokerManager.userStory == '') {
			return toast.error("Aucune User Story n'a été définie.");
		}

		if (users?.length < 1) {
			return toast.error('Aucune participant trouvé.');
		}

		changeState('playing');
	};

	const connect = () => {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		io.emit('join', { roomId, name: 'ADMIN', manager: true });
		// 858-616

		io.on('error', (e) => {
			if (e.reason == "Room doesn't exist") {
				toast.error("Ce poker planning n'existe pas !");
				goto('/create');
			}
		});

		io.on('players', (payload) => {
			users = payload;
		});

		io.on('state', (payload) => {
			pokerManager.state = payload.state;
		});

		io.on('game-update', (payload) => {
			if (payload?.hexcode && pokerManager?.hexcode != payload?.hexcode) {
				myshades({
					primary: payload.hexcode
				});
			}
			pokerManager = payload;
		});

		io.on('hexcode', (payload) => {
			myshades({
				primary: payload.hexcode
			});
		});
	};

	onMount(() => {
		url = `${window.location.protocol}//${window.location.host}/rooms/${roomId}`;
		connect();
	});

	onDestroy(() => {
		if (io) {
			io.emit('leave-room', { roomId });
		}
	});

	const changeState = (state) => {
		if (checkSocketConnected()) {
			io.send({ type: 'state', data: { state, userStory: pokerManager.userStory } });
		}
	};

	const checkSocketConnected = () => {
		console.log('io.connected', io.connected);

		if (!io.connected) {
			toast.error('Websocket not connected...');
			return false;
		}

		return true;
	};
</script>

<svelte:head><title>Poker Planning: {pokerManager.team}</title></svelte:head>

<main>
	<div class="manager">
		<div class="container">
			<h1>
				<span in:fly|local={{ easing: backOut, x: -25 }}> Poker Planning </span>
			</h1>

			<div class="me">Bienvenue {pokerManager.team}!</div>

			<Code code={roomId} {url} />
		</div>

		<label>Définissez ici votre user story:</label>
		<TextArea
			bind:value={pokerManager.userStory}
			disabled={pokerManager.state == 'result' || pokerManager.state == 'waiting'}
			minRows={1}
			maxRows={10}
		/>

		<div class="buttons">
			{#if pokerManager.state == 'playing'}
				<button
					onclick={() => {
						changeState('result');
					}}>Terminer Le Vote</button
				>
			{:else if pokerManager.state == 'result' || pokerManager.state == 'waiting'}
				<button onclick={canStarVote}>Commencer Le Vote</button>
			{/if}
		</div>
	</div>

	<div class="information">
		{#if users?.length < 1}
			<div>
				<p>Pas de participants pour la planification du poker.</p>
			</div>
		{:else}
			<p style="text-align: end;">{users.length} player{users.length > 1 ? 's' : ''}</p>
		{/if}

		{#each users as user}
			<div class="user">
				<div class="profile">
					<img src="https://api.dicebear.com/9.x/dylan/svg?seed={user.name}" />
					<h2>{user.name}</h2>
				</div>
				{#if pokerManager.state === 'playing'}
					<p class="skeleton" class:selectedLetter={user.selectedCard != null}></p>
				{:else if pokerManager.state === 'result'}
					<p>{user.selectedCard}</p>
				{:else}
					<h3 class="no-vote">-</h3>
				{/if}
			</div>
		{/each}
	</div>
</main>

<style lang="scss">
	main {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 0 1em;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100dvh;
		gap: 5dvh;

		.manager {
			padding: 5vw;
			max-height: 100dvh;

			.container {
				padding: 3rem 3rem 3rem 0;
				display: flex;
				flex-direction: column;
				min-height: 100%;
				color: var(--primary-950);

				> h1 {
					font-size: 3rem;
					font-weight: 900;
					line-height: 37px;

					span {
						display: block;
						width: max-content;
					}
				}

				& > .me {
					font-weight: 100;
					font-size: 1.5rem;

					margin-bottom: 3rem;
					opacity: 0.75;
				}
			}

			.buttons {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				gap: 1em;
				margin-top: 2em;

				button {
					width: 100%;
				}
			}
		}

		.information {
			max-height: 100dvh;
			padding: 0 3em;
			overflow-y: auto;
			gap: 1em;
			display: flex;
			flex-direction: column;

			.user {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				height: 3.5em;
				padding: 0 1em;
				border-radius: 5px;
				background-color: var(--primary-200);
				font-weight: 600;
				color: var(--primary-950);

				.profile {
					display: flex;
					gap: 0.5em;
					align-items: center;

					img {
						border-radius: 100%;
						border: 2px solid var(--primary-700);
						width: 40px;
						height: 40px;
					}
				}

				.no-vote {
					font-size: 2em;
					color: var(--primary-800);
				}

				.skeleton {
					width: 1.5em;
					aspect-ratio: 1;
					background-color: red;
					border-radius: 999999px;
					transition: background-color 0.3s !important;

					&.selectedLetter {
						background-color: green;
					}
				}

				p:not(.skeleton) {
					font-weight: 700;
					color: var(--primary-950);
					font-size: 1.5em;
				}
			}
		}
	}

	@media screen and (max-width: 950px) {
		main {
			grid-template-columns: 1fr;
			padding: 1em;
			height: auto;

			.information {
				max-height: none;
				padding: 0;
			}

			.manager {
				max-height: none;
				padding: 0;

				.container {
					padding: 1rem 1rem 2rem 0;
				}
			}
		}
	}
</style>
