<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Code from '$lib/components/Code.svelte';
	import TextArea from '$lib/components/Textarea.svelte';
	import myshades from '$lib/myshades';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { backOut, cubicInOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';
	import ioClient from 'socket.io-client';
	import Confetti from 'svelte-confetti';
	import { _ } from 'svelte-i18n';

	let roomId = $page.params.id;
	let url = $state('');

	let io: Socket;

	let resultsItem = $state(null);
	let resultDefender = $state(null);

	let history: object[] = $state([]);

	let displayConfetti = $state(false);
	let displayConfettiTimeout: NodeJS.Timeout | null = null;

	let pokerManager = $state({
		team: '',
		cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
		state: 'waiting',
		userStory: '',
		date: new Date().toISOString()
	});

	let users = $state(null);

	const canStarVote = () => {
		if (pokerManager.userStory == '') {
			return toast.error($_('ManagerPage.noUserStoryDefined'));
		}

		if (users?.length < 1) {
			return toast.error($_('ManagerPage.noParticipantsForVote'));
		}

		changeState('playing');
	};

	const connect = () => {
		io = ioClient(import.meta.env.VITE_BACKEND_URL);

		io.on('connect', () => {
			io.emit('join', { roomId, name: 'ADMIN', manager: true });
		});

		io.on('error', (e) => {
			if (e.reason == "Room doesn't exist") {
				toast.error($_('common.pokerPlanningDoesntExist'));
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
			resultsItem = null;
			resultDefender = null;
			displayConfetti = false;
			console.log('game-update', payload);

			if (displayConfettiTimeout) {
				clearTimeout(displayConfettiTimeout);
				displayConfettiTimeout = null;
			}

			if (payload?.hexcode && pokerManager?.hexcode != payload?.hexcode) {
				myshades({
					primary: payload.hexcode
				});
			}

			if (payload?.state == 'result') {
				if (payload?.result) {
					resultsItem = payload.result;
				}

				if (payload?.defender) {
					resultDefender = payload.defender;
				}

				if (payload?.history) {
					history = [...payload.history];
				}

				console.log('resultsItem', resultsItem);
				console.log('resultDefender', resultDefender);

				if (resultsItem?.length == 1 && resultsItem?.[0]?.players?.length > 1) {
					displayConfetti = true;

					displayConfettiTimeout = setTimeout(() => {
						displayConfetti = false;
					}, 15000);
				}
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
			io.removeAllListeners();
			io.disconnect();
		}

		if (displayConfettiTimeout) {
			clearTimeout(displayConfettiTimeout);
		}
	});

	const changeState = (state) => {
		if (checkSocketConnected()) {
			io.send({ type: 'state', data: { state, userStory: pokerManager.userStory } });
		}
	};

	const checkSocketConnected = () => {
		if (!io.connected) {
			toast.error($_('common.connectionWithServerLost'));
			return false;
		}

		return true;
	};

	const saveHistory = (test) => {
		window.localStorage.setItem(
			`PP_HISTORY_${pokerManager?.date}`,
			JSON.stringify({
				history,
				team: pokerManager.team,
				cards: pokerManager.cards,
				date: pokerManager.date
			})
		);
	};

	$effect(() => {
		console.log('history', history);
		if (history.length > 0) {
			saveHistory(history);
		}
	});
</script>

<svelte:head>
	<title>Planning Poker {pokerManager?.team || ''}</title>
	<meta
		name="description"
		content="Manage your session of planning poker with ease, with Another Planning Poker."
	/>
	<meta
		name="og:description"
		content="Manage your session of planning poker with ease, with Another Planning Poker."
	/>
	<meta
		name="twitter:description"
		content="Manage your session of planning poker with ease, with Another Planning Poker."
	/>
	<meta name="theme-color" content={pokerManager?.hexcode || '#ff910a'} />
</svelte:head>

{#if resultsItem}
	{#if displayConfetti}
		<div
			style="
				position: fixed;
				top: -50px;
				left: 0;
				height: 100dvh;
				width: 100dvw;
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
				duration={5000}
				amount={100}
				fallDistance="100dvh"
			/>
		</div>
	{/if}
{/if}

<main>
	<div class="manager">
		<div class="container">
			<a href="/" title="Go to Home Page" rel="home">
				<span in:fly|local={{ easing: backOut, x: -25 }}> Poker Planning </span>
			</a>

			<div class="me">
				{$_('ManagerPage.welcomeMessage', { values: { USER: pokerManager.team || '' } })}
			</div>

			<Code code={roomId} {url} />
		</div>

		<label for="userStory">{$_('ManagerPage.userStoryLabel')}</label>
		<TextArea
			bind:value={pokerManager.userStory}
			disabled={pokerManager.state == 'result' || pokerManager.state == 'waiting'}
			minRows={1}
			maxRows={10}
			placeholder="ManagerPage.textareaPlaceholder"
		/>

		<div class="buttons">
			{#if pokerManager.state == 'playing'}
				<button
					aria-label="Terminer les votes"
					on:click={() => {
						changeState('result');
					}}>{$_('ManagerPage.endVoteButton')}</button
				>
			{:else if pokerManager.state == 'result' || pokerManager.state == 'waiting'}
				<button aria-label="Commencer les votes" on:click={canStarVote}
					>{$_('ManagerPage.startVoteButton')}</button
				>
			{/if}
		</div>

		{#if resultsItem}
			<div
				class="resultDescription"
				transition:slide={{ axis: 'y', duration: 300, delay: 0, easing: cubicInOut }}
			>
				{#each resultsItem as { item, pourcentage }}
					<span
						><h3>{item}</h3>
						{pourcentage}%</span
					>
				{/each}
			</div>
		{/if}
	</div>

	<div class="information">
		{#if users != null}
			{#if users?.length < 1}
				<div>
					<p style="text-align: center;">{$_('ManagerPage.noParticipantsMessage')}</p>
				</div>
			{:else}
				<p style="text-align: end;">{users.length} player{users.length > 1 ? 's' : ''}</p>
			{/if}

			{#each users as user (user.id)}
				<div
					class="user"
					class:defender={resultDefender?.name == user?.name &&
						resultDefender?.item == user?.selectedCard}
					out:slide={{ axis: 'y', duration: 300, delay: 0, easing: cubicInOut }}
					in:slide={{ axis: 'x', duration: 300, delay: 0, easing: cubicInOut }}
				>
					<div class="profile">
						<img
							alt={'avatar for ' + user.name}
							src={(pokerManager?.avatar || 'https://api.dicebear.com/9.x/dylan/svg') +
								`?seed=${user.name}`}
						/>
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
		{:else}
			{#each Array(5).fill(0) as _}
				<div class="user">
					<div class="profile">
						<div class="img-skeleton"></div>
						<span class="name-skeleton"></span>
					</div>
				</div>
			{/each}
		{/if}
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

		.resultDescription {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			column-gap: 1.5em;
			row-gap: 1em;
			margin-top: 2em;

			span {
				display: flex;
				flex-direction: row;
				gap: 0.7em;
				color: var(--primary-50);
				align-items: center;
				justify-content: center;
				background-color: var(--primary-800);
				padding: 0.5em 1em;
				border-radius: 99999px;
				font-size: 1em;
				h3 {
					font-size: 1.3em;
					color: var(--primary-50);
					font-weight: 800;
				}
			}
		}

		.manager {
			padding: 5vw;
			max-height: 100dvh;

			.container {
				padding: 3rem 3rem 3rem 0;
				display: flex;
				flex-direction: column;
				min-height: 100%;
				color: var(--primary-950);

				> a {
					font-size: 3rem;
					font-weight: 900;
					line-height: 37px;
					cursor: pointer;
					text-decoration: none;

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
			display: flex;
			flex-direction: column;

			.user {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				height: 3.5em;
				padding: 0 1em;
				margin-bottom: 1em;
				border-radius: 5px;
				background-color: var(--primary-200);
				font-weight: 600;
				color: var(--primary-950);
				box-sizing: border-box;

				&.defender {
					box-shadow: 0 0 5px var(--primary-800);
					animation: breathing 2s infinite ease-in-out;

					@keyframes breathing {
						0% {
							box-shadow: 0 0 0 5px var(--primary-800);
						}
						50% {
							box-shadow: 0 0 0 1px var(--primary-800);
						}
						100% {
							box-shadow: 0 0 0 5px var(--primary-800);
						}
					}
				}

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

					.img-skeleton {
						border: 2px solid var(--primary-700);
						width: 40px;
						height: 40px;
						background-color: var(--primary-500);
						border-radius: 100%;
					}

					.name-skeleton {
						background-color: var(--primary-500);
						width: 100px;
						height: 20px;
						border-radius: 5px;
						background: linear-gradient(
							120deg,
							var(--primary-300),
							var(--primary-500),
							var(--primary-700)
						);
						background-size: 200% 200%;
						animation: shimmer 1s infinite alternate;

						@keyframes shimmer {
							0% {
								background-position: 0% 50%;
							}
							100% {
								background-position: 100% 50%;
							}
						}
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

	@media (prefers-color-scheme: dark) {
		a {
			color: var(--primary-100);
		}

		.me {
			color: var(--primary-200);
		}

		label {
			color: var(--primary-50);
		}

		.information {
			p {
				color: var(--primary-100);
			}

			.user {
				&.defender {
					box-shadow: 0 0 5px var(--primary-600);

					@keyframes breathing {
						0% {
							box-shadow: 0 0 0 5px var(--primary-600);
						}
						50% {
							box-shadow: 0 0 0 1px var(--primary-600);
						}
						100% {
							box-shadow: 0 0 0 5px var(--primary-600);
						}
					}
				}
			}
		}
	}
</style>
