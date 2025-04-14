<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import AvatarCreation from '$lib/components/AvatarCreation.svelte';
	import Card from '$lib/components/cards/Card.svelte';
	import ConfettiFullscreen from '$lib/components/ConfettiFullscreen.svelte';
	import Observers from '$lib/components/Observers.svelte';
	import UserStory from '$lib/components/UserStory.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import type { PokerManager } from '$lib/components/types/PokerManager';
	import type { ResultDefender } from '$lib/components/types/ResultDefender';
	import type { ResultItems } from '$lib/components/types/ResultItems';
	import type { Users } from '$lib/components/types/Users';
	import myshades from '$lib/myshades';
	import { arraysAreEqual } from '$lib/utils';
	import type { Socket } from 'socket.io-client';
	import ioClient from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { toast } from 'svelte-sonner';
	import { quintInOut, quintOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';
	import Cards from '$lib/components/cards/Cards.svelte';
	import Waiting from '$lib/components/Waiting.svelte';

	const ROOM_ID_REGEX = /^\d{3}-\d{3}$/i;
	const DEFAUT_AVATAR_URL = 'https://api.dicebear.com/9.x/dylan/svg';

	let io: Socket;

	let roomId: string;
	let avatarType: string | null = $state('dylan');
	let hexcode = $state('');

	let pokerManager: PokerManager | null = $state(null);
	let status = $state('waiting');

	let timeout: number | null;

	let username: string = $state('');
	let customAvatarUrl: string | null = $state('');
	let loadingCustomAvatar = $state(false);
	let selectedLetter = $state(null);
	let isObserver = $state(false);

	let submitting = $state(false);
	let submittedLetter = $state(null);

	let resultItems: ResultItems = $state(null);
	let resultDefender: ResultDefender = $state(null);

	let players: Users = $state(null);
	let observers: Users = $state(null);

	let waitingChangeRole = $state(false);

	onMount(() => {
		try {
			if (window?.localStorage?.getItem?.('username')) {
				username = window.localStorage.getItem('username') || '';
			}

			if (window?.localStorage?.getItem?.('avatar')) {
				customAvatarUrl = window.localStorage.getItem('avatar') || '';
			}

			if (window?.localStorage?.getItem?.('observer')) {
				isObserver = window.localStorage.getItem('observer') == 'true';
			}

			// Old configuration format (many user like this format)
			if ($page.params.configuration && ROOM_ID_REGEX.test($page.params.configuration)) {
				roomId = $page.params.configuration;
				avatarType = null;
			} else {
				const roomConfig = JSON.parse(atob($page.params.configuration));

				roomId = roomConfig?.r;
				avatarType = roomConfig?.a;

				if (roomConfig?.c && roomConfig?.c?.length == 7 && roomConfig?.c?.startsWith?.('#')) {
					myshades({
						primary: roomConfig.c
					});
				}
			}
		} catch (e) {
			console.error('Error in RoomPage', e);
		}

		if (!roomId || !ROOM_ID_REGEX.test(roomId)) {
			return goto('/join');
		}

		status = 'init';
	});

	onDestroy(() => {
		if (io) {
			io.removeAllListeners();
			io.disconnect();
		}
	});

	$effect(() => {
		window.localStorage.setItem('username', username);
	});

	$effect(() => {
		window.localStorage.setItem('observer', isObserver.toString());
	});

	const connect = () => {
		if (username?.trim?.() == '') {
			return toast.info($_('RoomPage.IWantYourName'));
		}

		if (submitting) return;
		try {
			submitting = true;
			io = ioClient(import.meta.env.VITE_BACKEND_URL);

			io.on('connect', () => {
				io.emit('join', {
					roomId,
					name: username,
					avatar: customAvatarUrl,
					role: isObserver ? 'observer' : 'player'
				});

				if (submittedLetter != null) {
					sendVote(submittedLetter);
				}
			});

			io.on('game-update', (payload) => {
				resultItems = null;
				resultDefender = null;

				if (arraysAreEqual(pokerManager?.cards, payload?.cards) == false) {
					selectedLetter = null;
					submittedLetter = null;
				}

				if (payload.state == 'playing' && payload.state != pokerManager?.state) {
					selectedLetter = null;
					submittedLetter = null;
				} else if (payload?.state == 'result') {
					if (payload?.result) {
						resultItems = payload.result;
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

			io.on('players', (payload) => {
				if (payload.players) {
					players = payload.players;
				}

				if (payload.observers) {
					observers = payload.observers;
				}
			});

			io.on('hexcode', (payload) => {
				myshades({
					primary: payload.hexcode
				});
			});

			io.on('message', (payload) => {
				const type: keyof typeof toast = payload.type;
				if (!['info', 'success', 'error', 'warning'].includes(type)) return;

				(toast[type] as (message: string) => void)(payload.message);
			});

			io.on('delete-room', () => {
				toast.info($_('RoomPage.RoomDeleted'));
				goto('/join');
			});

			io.on('error', (e) => {
				console.error('WEBSOCKET ERROR', e);

				if (e.reason == "Room doesn't exist") {
					toast.error($_('common.pokerPlanningDoesntExist'));
					goto('/join');
				}

				submitting = false;
			});

			io.on('connect_error', function (err) {
				io.disconnect();
				io.removeAllListeners();
				submitting = false;
			});
		} catch (e) {
			console.error('Websocket error', e);
			toast.error($_('RoomPage.ErrorWhenJoining'));
			submitting = false;
		}
	};

	const sendVote = (forceValue = selectedLetter) => {
		timeout = setTimeout(() => {
			errorWhenSendingVote();
		}, 2000);

		io.send({ type: 'vote', data: { card: forceValue } }, (callback: { success: boolean }) => {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}

			if (!callback?.success) {
				errorWhenSendingVote();
			}
		});

		submittedLetter = forceValue;
	};

	const errorWhenSendingVote = () => {
		toast.error($_('RoomPage.ErrorWhenSendingVote'));
		submittedLetter = null;
		selectedLetter = null;
	};

	const sendHexa = () => {
		if (hexcode.toLowerCase() == 'random') {
			hexcode = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
			if (hexcode.length < 7) hexcode = hexcode.padEnd(7, '0');
		}

		const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		if (!hexColorRegex.test(hexcode)) {
			return toast.error(`HexaCode '${hexcode}' not valid`);
		}

		io.send({ type: 'hexcode', data: { hexcode } });
	};

	const roleChange = () => {
		if (waitingChangeRole) return;

		waitingChangeRole = true;
		io.send({ type: 'toggleRole' }, (callback: { success: boolean }) => {
			if (callback?.success) {
				selectedLetter = null;
				submittedLetter = null;
				isObserver = callback?.role == 'observer';
			} else {
				toast.error($_('RoomPage.ErrorWhenChangingRole'));
			}

			waitingChangeRole = false;
		});
	};
</script>

<svelte:head>
	<title>{pokerManager?.team || ''} Another Poker Planning</title>
	<meta
		name="description"
		content="Your private planning poker room where you can vote on user stories."
	/>
	<meta
		name="og:description"
		content="Your private planning poker room where you can vote on user stories."
	/>
	<meta
		name="twitter:description"
		content="Your private planning poker room where you can vote on user stories."
	/>
	<meta name="theme-color" content={pokerManager?.hexcode || '#ff910a'} />
</svelte:head>

{#if status == 'init' && pokerManager == null}
	<div class="init-page" in:scale={{ duration: 300, easing: quintOut }}>
		<h1>
			{$_('RoomPage.welcome')} <span class="rotateAnimation">👋</span> <br />{$_(
				'RoomPage.whatIsYourName'
			)}<br />
		</h1>
		<form on:submit|preventDefault={connect}>
			{#if avatarType != null}
				<AvatarCreation
					bind:customAvatarUrl
					bind:loading={loadingCustomAvatar}
					{avatarType}
					{username}
				/>
			{/if}

			<input
				type="text"
				bind:value={username}
				placeholder="Jean Bon"
				disabled={submitting}
				maxlength="32"
			/>
			<div class="observer">
				<input type="checkbox" bind:checked={isObserver} />
				<Tooltip title={$_('RoomPage.observerTooltip')}>
					<label
						on:click={() => {
							isObserver = !isObserver;
						}}>{$_('RoomPage.observer')}</label
					>
				</Tooltip>
			</div>
			<button
				class:button--loading={submitting}
				aria-label="Validate your name"
				type="submit"
				disabled={submitting || (customAvatarUrl != null && loadingCustomAvatar)}
			>
				<span class="button__text">{$_('RoomPage.validateButton')}</span></button
			>
		</form>
	</div>
{:else if pokerManager != null}
	<main>
		<form on:submit|preventDefault={sendHexa} style="display: none;">
			<input type="text" bind:value={hexcode} placeholder="#FF00EE" disabled={submitting} />
		</form>

		<Observers
			pokerAvatarType={pokerManager?.avatar}
			{DEFAUT_AVATAR_URL}
			{roleChange}
			{observers}
			{isObserver}
		/>

		{#if pokerManager.state === 'waiting'}
			<Waiting {DEFAUT_AVATAR_URL} {observers} {players} pokerAvatarType={pokerManager?.avatar} />
		{:else if pokerManager.state === 'playing'}
			<UserStory userStory={pokerManager?.userStory} />

			<Cards
				cards={pokerManager?.cards || []}
				{isObserver}
				bind:selectedLetter
				bind:submittedLetter
				{sendVote}
			/>
		{:else if pokerManager.state === 'result'}
			<div class="results-container">
				<div class="results" in:fade={{ duration: 700, easing: quintInOut }}>
					<div class="header">
						<h1>{$_('RoomPage.resultsTitle')}</h1>

						{#if resultDefender}
							<h3
								in:scale={{
									delay: 200,
									duration: 500,
									easing: quintInOut
								}}
							>
								<div>
									<img
										alt="User-avatar"
										src={resultDefender?.avatar ||
											(pokerManager?.avatar || DEFAUT_AVATAR_URL) + `?seed=${resultDefender?.name}`}
									/>
									<span>{resultDefender?.name}</span>
								</div>
								{$_('RoomPage.resultDefenderQuestion')}
								<span> {resultDefender?.item}</span> ?
							</h3>
						{/if}
					</div>

					<div class="result">
						{#if resultItems}
							{#if resultItems?.length == 1 && resultItems?.[0]?.players?.length > 1}
								<ConfettiFullscreen />
							{/if}

							{#each resultItems as { item, players, pourcentage }, i (item)}
								<div class="result-item">
									<ProgressBar {pourcentage} {item} delay={i} />
									<div class="players-container">
										{#each players as player}
											<span class="player">
												<img
													alt="User-avatar"
													src={player?.avatar ||
														(pokerManager?.avatar || DEFAUT_AVATAR_URL) + `?seed=${player?.name}`}
												/>
												{player?.name}
											</span>
										{/each}
									</div>
								</div>
							{/each}
						{:else}
							<p class="no-vote">{$_('RoomPage.noVotesMessage')}</p>
						{/if}
					</div>
				</div>

				<!-- //-------------- -->

				{#if pokerManager?.voteOnResults && !isObserver}
					<div class="cards" in:fade={{ duration: 500, easing: quintOut }}>
						{#each pokerManager.cards as card}
							<Card
								height={'12dvh'}
								style={'aspect-ratio: 4/2'}
								content={card}
								bind:cardSelected={selectedLetter}
								bind:submittedLetter
								canRemove={false}
								clickHandler={() => {
									sendVote();
								}}
							/>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</main>
{/if}

<style lang="scss">
	.results-container {
		display: flex;
		max-width: 100dvw;
		max-height: 100dvh;
		overflow: hidden;

		width: 100dvw;
		align-items: center;
		justify-content: space-evenly;

		.cards {
			display: flex;
			flex-wrap: nowrap;
			flex-direction: column;
			row-gap: 1em;
			padding: 0 10px;

			height: 80vh;
			overflow-y: auto;

			scroll-snap-type: y mandatory;
			scroll-behavior: smooth;
		}

		.results {
			display: flex;
			flex-direction: column;

			.header {
				display: flex;
				align-items: center;
				flex-direction: column;
				min-height: 20dvh;
				justify-content: space-evenly;

				> h3 {
					font-size: 2em;

					& > div {
						display: flex;
						align-items: center;
						justify-content: center;
					}

					img {
						min-width: 40px;
						min-height: 40px;
						max-width: 40px;
						max-height: 40px;
						margin-right: 12px;
						border-radius: 100%;
						border: 2px solid var(--primary-800);
						object-fit: cover;
					}

					span {
						font-weight: 600;
						color: var(--primary-700);
					}
				}

				> h1 {
					font-size: 2em;
					color: var(--primary-800);
					font-weight: 800;
				}
			}

			.result {
				margin-top: 5dvh;
				max-height: 75dvh;
				overflow: auto;
				padding: 1em 1em 3em 1em;
				display: flex;
				flex-direction: column;
				align-items: center;
				scroll-behavior: smooth;
			}

			.no-vote {
				font-size: 1.5em;
				font-weight: 800;
				color: var(--primary-600);
			}

			.result {
				display: flex;
				flex-direction: column;
				gap: 1em;

				.result-item {
					border: 3px solid var(--primary-600);
					padding: 0.5em;
					border-radius: calc(23px + 0.5em);
					display: flex;
					flex-direction: column;
					gap: 0.3em;
					min-width: 98%;
					max-width: 98%;

					.players-container {
						display: flex;
						column-gap: 1em;
						row-gap: 0.3em;
						flex-direction: row;
						flex-wrap: wrap;
						align-items: center;
						justify-content: center;
						span.player {
							display: flex;
							gap: 0.3em;
							align-items: center;

							img {
								min-width: 2em;
								min-height: 2em;
								max-width: 2em;
								max-height: 2em;
								border-radius: 100%;
								object-fit: cover;
								aspect-ratio: 1;
							}
						}
					}
				}
			}
		}
	}

	.init-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100dvh;
		text-align: center;

		.observer {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5em;
			margin-bottom: 1em;
			color: var(--primary-800);
			user-select: none;
			cursor: pointer;

			input {
				accent-color: var(--primary-500);

				outline: none;
				box-shadow: none;
			}

			label {
				font-weight: 600;
				cursor: pointer;
			}
		}

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
			gap: 0.3em;

			img {
				border-radius: 100%;
				border: 2px solid var(--primary-700);
				min-width: 80px;
				min-height: 80px;
				max-width: 80px;
				max-height: 80px;
				margin-bottom: 1em;
				justify-self: center;
			}

			input {
				text-align: center;
			}

			button {
				position: relative;
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

		button {
			position: sticky;
			bottom: 2em;

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
				position: initial;
			}
		}

		.hidden {
			visibility: hidden;
		}
	}

	@media (min-width: 600px) {
		.result-item {
			width: 50vw;
		}
	}

	@media (max-width: 599px) {
		.results-container {
			.cards {
				display: none;
			}
		}
	}

	@media (min-width: 1100px) {
		.result-item {
			width: 40vw;
		}
	}

	@media (min-width: 1300px) {
		.result-item {
			width: 30vw;
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

			button {
				position: sticky;
				bottom: 1em;
				width: 80%;
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		.results-container {
			.result-item {
				border-color: var(--primary-800);
				background-color: var(--primary-800);
				color: var(--primary-200);
			}
		}

		main {
			h1 {
				color: var(--primary-100);
			}
		}

		button:disabled {
			filter: grayscale(1);
			cursor: not-allowed;
		}

		.results-container {
			.results {
				.header {
					h1 {
						color: var(--primary-300);
					}
					h3 {
						color: var(--primary-100);

						span {
							color: var(--primary-500);
						}

						img {
							border-color: var(--primary-500);
						}
					}
				}
			}
		}

		.result {
			.result-item {
				border-color: var(--primary-500) !important;
				background-color: var(--primary-800) !important;
				color: var(--primary-100) !important;

				.pourcentage {
					color: var(--primary-200) !important;
				}

				h1,
				p {
					color: var(--primary-900) !important;
				}
			}
		}

		.init-page {
			h1 {
				color: var(--primary-100);
			}

			input {
				background-color: var(--primary-800);
				color: var(--primary-200);
				border: 1px solid var(--primary-500);
			}

			.observer {
				color: var(--primary-200);
			}
		}
	}
</style>
