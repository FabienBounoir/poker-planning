<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import AvatarCreation from '$lib/components/AvatarCreation.svelte';
	import Card from '$lib/components/Card.svelte';
	import ConfettiFullscreen from '$lib/components/ConfettiFullscreen.svelte';
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
	import { cubicInOut, quintInOut, quintOut } from 'svelte/easing';
	import { fade, scale, slide } from 'svelte/transition';

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

	let existingPositions: { top: number; left: number }[] = [];

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
		window.localStorage.setItem('observer', true);
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

				submitting = false;
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
				players = payload.players;
				observers = payload.observers;
				console.log('observers', observers);
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

	const includeUS_ID = (userStory: string) => {
		const match = userStory.match(/NFS-\d+/i);
		return match ? `https://portail.agir.orange.com/browse/${match[0]}` : null;
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

	const errorWhenSendingVote = () => {
		toast.error($_('RoomPage.ErrorWhenSendingVote'));
		submittedLetter = null;
		selectedLetter = null;
	};

	const isPositionFree = (top: number, left: number) => {
		return !existingPositions.some(
			(pos) => Math.abs(pos.top - top) < 15 && Math.abs(pos.left - left) < 15
		);
	};

	const getRandomPosition = () => {
		let top, left;
		let tries = 0;
		const maxTries = 15;

		do {
			top = Math.random() < 0.5 ? Math.random() * 20 + 20 : Math.random() * 20 + 60;
			left = Math.random() < 0.5 ? Math.random() * 20 + 20 : Math.random() * 20 + 60;
			tries++;
		} while (!isPositionFree(top, left) && tries < maxTries);

		if (tries < maxTries) existingPositions.push({ top, left });

		return `--top: ${top}vh; --left: ${left}vw;`;
	};

	const roleChange = () => {
		waitingChangeRole = true;
		io.send({ type: 'toggleRole' }, (callback: { success: boolean }) => {
			console.log('callback', callback);
			if (callback?.success) {
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

		<div class="observer-container">
			<div class="manage-state" on:click={roleChange}>
				{#if isObserver}
					<i class="fa-solid fa-right-from-bracket"></i>
					<span>{$_('RoomPage.leaveObserver')}</span>
				{:else}
					<i class="fa-solid fa-eye"></i>
					<span>{$_('RoomPage.becomeObserver')}</span>
				{/if}
			</div>

			{#if observers && observers.length > 0}
				<span class="separator"></span>

				{#each observers as observer}
					<div
						class="observer-display"
						transition:slide={{ axis: 'y', duration: 300, delay: 0, easing: cubicInOut }}
					>
						<img
							alt="User-avatar"
							src={observer?.avatar ||
								(pokerManager?.avatar || DEFAUT_AVATAR_URL) + `?seed=${observer.name}`}
						/>
						<span>{observer.name}</span>
					</div>
				{/each}
			{/if}
		</div>

		{#if pokerManager.state === 'waiting'}
			<h3 class="player-count-display">
				{players && players.length > 0 ? `${players.length} player` : ''}
				{players && players.length > 0 && observers && observers.length > 0 ? ' + ' : ''}
				{observers && observers.length > 0 ? `${observers?.length} observer` : ''}
			</h3>

			<h1>{$_('RoomPage.waitingForVotes')}</h1>
			{#if players}
				{#each players as player}
					<div
						class="player-display"
						style={getRandomPosition()}
						transition:scale={{ duration: 500 }}
					>
						<img
							alt="User-avatar"
							src={player?.avatar ||
								(pokerManager?.avatar || DEFAUT_AVATAR_URL) + `?seed=${player.name}`}
						/>
						<span>{player.name}</span>
					</div>
				{/each}
			{/if}
		{:else if pokerManager.state === 'playing'}
			{#if pokerManager?.userStory}
				<div class="user-story" transition:scale={{ duration: 500 }}>
					<h3>User story</h3>
					{#if includeUS_ID(pokerManager.userStory) !== null}
						<h1>
							<a
								title="Open User story on jira"
								target="_blank"
								href={includeUS_ID(pokerManager.userStory)}>{pokerManager.userStory}</a
							>
						</h1>
					{:else}
						<h1>{pokerManager.userStory}</h1>
					{/if}
				</div>
			{/if}

			{#if isObserver}
				<h1>{$_('RoomPage.voteInProgress')}</h1>
			{:else}
				<div class="flex" in:fade={{ duration: 500, easing: quintOut }}>
					{#each pokerManager.cards as card}
						<Card
							content={card}
							bind:cardSelected={selectedLetter}
							bind:submittedLetter
							clickHandler={() => {
								sendVote();
							}}
						/>
					{/each}
				</div>
			{/if}
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

							{#each resultItems as { item, players, pourcentage }, i}
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
						width: 40px;
						height: 40px;
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
								height: 2em;
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
				width: 80px;
				height: 80px;
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

		.observer-container {
			position: fixed;
			top: 20vh;
			left: 0;

			background-color: var(--primary-200);
			max-height: calc(100dvh - 40vh);

			border-top-right-radius: 1em;
			border-bottom-right-radius: 1em;
			padding: 0.5em;
			display: flex;
			flex-direction: column;
			gap: 0.5em;

			display: flex;
			align-items: center;
			// overflow-y: auto; compliquer on voit plus le span...

			.separator {
				width: 80%;
				min-height: 0.3em;
				border-radius: 5px;
				background-color: var(--primary-500);
			}

			.manage-state {
				width: 40px;
				min-height: 40px;
				border-radius: 100%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				background-color: var(--primary-700);
				color: var(--primary-200);
				position: relative;

				&:hover span {
					opacity: 1;
				}

				span {
					position: absolute;
					opacity: 0;
					pointer-events: none;
					font-size: 1em;
					width: max-content;
					left: 50px;
					background-color: var(--primary-900);
					color: var(--primary-200);
					padding: 0.2em 0.5em;
					border-radius: 5px;
					transition: opacity 0.2s ease-in-out;
				}
			}

			.observer-display {
				position: relative;

				img {
					width: 40px;
					height: 40px;
					border-radius: 100%;
					border: 2px solid var(--primary-700);
					object-fit: cover;
					cursor: pointer;
				}

				&:hover span {
					opacity: 1;
				}

				span {
					position: absolute;
					transform: translate(0, 25%);
					opacity: 0;
					pointer-events: none;
					font-size: 1em;
					width: max-content;
					left: 50px;
					background-color: var(--primary-900);
					color: var(--primary-200);
					padding: 0.2em 0.5em;
					border-radius: 5px;
					transition: opacity 0.2s ease-in-out;
				}
			}
		}

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
				object-fit: cover;
			}
		}

		button {
			position: sticky;
			bottom: 2em;

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
				position: initial;
			}
		}

		.user-story {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 0.5em;
			color: var(--primary-950);
			width: 85vw;

			h1 {
				font-size: 2em;
				white-space: pre-line;
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
			max-width: 80vw;

			&.vertical {
				flex-direction: column;
				align-items: center;
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

	@media screen and (max-width: 1100px) {
		main {
			.observer-container {
				display: none;
			}

			.flex {
				max-width: 100vw;
			}
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
			}

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
			.player-count-display {
				color: var(--primary-300);
			}

			h1 {
				color: var(--primary-100);
			}
		}

		.player-display {
			color: var(--primary-400);

			img {
				background-color: var(--primary-800);
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
