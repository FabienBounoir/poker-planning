<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Code from '$lib/components/Code.svelte';
	import ConfettiFullscreen from '$lib/components/ConfettiFullscreen.svelte';
	import EditConfiguration from '$lib/components/EditConfiguration.svelte';
	import TextArea from '$lib/components/Textarea.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import type { PokerManager } from '$lib/components/types/PokerManager';
	import type { ResultDefender } from '$lib/components/types/ResultDefender';
	import type { ResultItems } from '$lib/components/types/ResultItems';
	import type { Users } from '$lib/components/types/Users';
	import Valided from '$lib/components/Valided.svelte';
	import myshades from '$lib/myshades';
	import { dataToShortBinary } from '$lib/utils';
	import type { Socket } from 'socket.io-client';
	import ioClient from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { toast } from 'svelte-sonner';
	import { backOut, cubicInOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';

	const roomId = $page.params.id;
	let url = $state('');

	let io: Socket;
	let editRoom = $state(false);

	let resultsItem: ResultItems = $state(null);
	let resultDefender: ResultDefender = $state(null);

	let history: object[] = $state([]);

	let displayConfetti = $state(false);
	let displayConfettiTimeout: ReturnType<typeof setTimeout> | null = null;

	let pokerManager: PokerManager = $state({
		team: '',
		cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
		state: 'waiting',
		userStory: '',
		date: new Date().toISOString()
	});

	let players: Users = $state(null);
	let observers: Users = $state(null);

	const canStarVote = () => {
		if (pokerManager?.userStory == '') {
			return toast.error($_('ManagerPage.noUserStoryDefined'));
		}

		if (players && players.length < 1) {
			return toast.error($_('ManagerPage.noParticipantsForVote'));
		}

		changeState('playing');
	};

	const connect = () => {
		io = ioClient(import.meta.env.VITE_BACKEND_URL);

		io.on('connect', () => {
			io.emit('join', { roomId, name: 'ADMIN', role: 'manager' });
		});

		io.on('error', (e) => {
			if (e.reason == "Room doesn't exist") {
				toast.error($_('common.pokerPlanningDoesntExist'));
				goto('/create');
			}
		});

		io.on('players', (payload) => {
			players = payload.players;
			observers = payload.observers;
		});

		io.on('state', (payload) => {
			pokerManager.state = payload.state;
		});

		io.on('game-update', (payload) => {
			resultsItem = null;
			resultDefender = null;
			displayConfetti = false;

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

				if (resultsItem?.length == 1 && resultsItem?.[0]?.players?.length > 1) {
					displayConfetti = true;

					displayConfettiTimeout = setTimeout(() => {
						displayConfetti = false;
					}, 10000);
				}
			}

			pokerManager = payload;
		});

		io.on('delete-room', () => {
			toast.success($_('RoomPage.SuccessfullyDeleted'));
			goto('/create');
		});

		io.on('hexcode', (payload) => {
			myshades({
				primary: payload.hexcode
			});
		});
	};

	const changeState = (state: string) => {
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

	const saveHistory = () => {
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

	const deleteRoom = () => {
		if (checkSocketConnected()) {
			io.send({ type: 'delete-room' });
		}
	};

	const updateRoom = (data: PokerManager) => {
		if (checkSocketConnected()) {
			io.send({ type: 'update-room', data }, (response: { error: string; success: boolean }) => {
				if (response?.error) {
					toast.error(response.error);
				} else {
					toast.success($_('RoomPage.SuccessfullyUpdated'));
					editRoom = false;
				}
			});
		}
	};

	onMount(() => {
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

	$effect(() => {
		if (history && history.length > 0) {
			saveHistory();
		}
	});

	$effect(() => {
		url = `${window.location.protocol}//${window.location.host}/rooms/${dataToShortBinary(pokerManager)}`;
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
		<ConfettiFullscreen />
	{/if}
{/if}

<main>
	{#if editRoom}
		<div class="manager">
			<EditConfiguration bind:editRoom {pokerManager} {deleteRoom} {updateRoom} />
		</div>
	{:else}
		<div class="manager">
			<div class="container">
				<a href="/" title="Go to Home Page" rel="home">
					<span in:fly|local={{ easing: backOut, x: -25 }}> Poker Planning </span>
				</a>

				<div class="me">
					{$_('ManagerPage.welcomeMessage', { values: { USER: pokerManager.team || '' } })}
				</div>

				<Code code={roomId} {url} hexcode={pokerManager?.hexcode} />
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
						class="danger"
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
				<button aria-label="menu-button" on:click={() => (editRoom = true)}>
					<i class="fa-solid fa-edit"></i>
				</button>
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
	{/if}

	<div class="information">
		{#if players != null}
			{#if players?.length < 1}
				<div>
					<p style="text-align: center;">{$_('ManagerPage.noParticipantsMessage')}</p>
				</div>
			{:else}
				<div class="header">
					{#if observers && observers.length > 0}
						<p>{observers?.length} observer{observers?.length > 1 ? 's' : ''}</p>
					{/if}
					<p style="margin-left: auto;">{players.length} player{players.length > 1 ? 's' : ''}</p>
				</div>
			{/if}

			{#each players as user (user.id)}
				<div
					class="user"
					class:defender={resultDefender?.name == user?.name &&
						resultDefender?.item == user?.selectedCard}
					out:slide={{ axis: 'y', duration: 300, delay: 0, easing: cubicInOut }}
					in:slide={{ axis: 'x', duration: 300, delay: 0, easing: cubicInOut }}
				>
					<div class="profile">
						<div class="image-container">
							<img
								alt={'avatar for ' + user.name}
								src={user?.avatar ||
									(pokerManager?.avatar || 'https://api.dicebear.com/9.x/dylan/svg') +
										`?seed=${user.name}`}
							/>
						</div>
						<h2>{user.name}</h2>
						{#if user?.firstVoter && pokerManager.state == 'result'}
							<Tooltip title={$_('ManagerPage.firstVoterTooltip')}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="25px"
									viewBox="0 0 24 24"
									fill="none"
								>
									<path
										d="M20 15.0002C20 19.2547 17.3819 21.1216 15.3588 21.7512C14.9274 21.8854 14.6438 21.3825 14.9019 21.0116C15.7823 19.7464 16.8 17.8161 16.8 16.0002C16.8 14.0496 15.1559 11.7467 13.8721 10.3263C13.5786 10.0016 13.0667 10.2164 13.0507 10.6539C12.9976 12.1031 12.7689 14.042 11.7828 15.5616C11.6241 15.8062 11.2872 15.8264 11.1063 15.5977C10.7982 15.208 10.4901 14.7267 10.182 14.3464C10.016 14.1416 9.71604 14.1388 9.52461 14.32C8.77825 15.0267 7.73333 16.1288 7.73333 17.5002C7.73333 18.4301 8.0936 19.405 8.50007 20.1893C8.72368 20.6208 8.32607 21.1402 7.89573 20.9144C6.11307 19.9789 4 18.0838 4 15.0002C4 11.8538 8.31029 7.49503 9.95605 3.37712C10.2157 2.72733 11.0161 2.42199 11.5727 2.84603C14.9439 5.41409 20 10.3783 20 15.0002Z"
									/>
								</svg>
							</Tooltip>
						{/if}
					</div>
					{#if pokerManager.state === 'playing'}
						<Valided valided={user.selectedCard != null} />
					{:else if pokerManager.state === 'result'}
						<p>{user.selectedCard}</p>
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

				button:first-child {
					width: 100%;
				}

				button.danger {
					background-color: var(--primary-300);
				}

				button:last-child {
					i {
						font-size: 1.2em;
					}
				}
			}
		}

		.information {
			max-height: 100dvh;
			padding: 0 3em;
			overflow-y: auto;
			display: flex;
			flex-direction: column;

			.header {
				display: flex;
				align-items: end;
				justify-content: space-between;
			}

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

					svg {
						path {
							fill: var(--primary-950);
						}
					}

					.image-container {
						position: relative;
						width: 40px;
						height: 40px;
						img {
							border-radius: 100%;
							border: 2px solid var(--primary-700);
							width: 40px;
							height: 40px;
							object-fit: cover;
						}
					}

					.img-skeleton {
						border: 2px solid var(--primary-700);
						width: 40px;
						height: 40px;
						background-color: var(--primary-500);
						border-radius: 100%;
					}

					.name-skeleton {
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
				overflow-y: initial;
				max-height: none;
				padding: 0;
			}

			.manager {
				max-height: none;
				padding: 0;

				.container {
					padding: 1rem 1rem 2rem 0;

					> a {
						span {
							width: initial;
						}
					}
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

		main {
			.information {
				p {
					color: var(--primary-100);
				}

				.user {
					background-color: var(--primary-500);

					&.defender {
						box-shadow: 0 0 5px var(--primary-300);

						@keyframes breathing {
							0% {
								box-shadow: 0 0 0 5px var(--primary-300);
							}
							50% {
								box-shadow: 0 0 0 1px var(--primary-300);
							}
							100% {
								box-shadow: 0 0 0 5px var(--primary-300);
							}
						}
					}

					.profile {
						svg {
							path {
								fill: var(--primary-950);
							}
						}

						.img-skeleton {
							border: 2px solid var(--primary-900);
						}

						.name-skeleton {
							background: linear-gradient(120deg, var(--primary-400), var(--primary-800));

							background-size: 200% 200%;
						}
					}

					p {
						color: var(--primary-950);
						font-weight: 700;
						font-size: 1.3em;
					}
				}
			}
		}
	}
</style>
