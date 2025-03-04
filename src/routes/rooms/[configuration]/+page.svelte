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
	import { _ } from 'svelte-i18n';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { arraysAreEqual } from '$lib/utils';

	let roomId: string;
	let avatarType = 'dylan';
	let io: Socket;

	let pokerManager = $state(null);
	let status = $state('waiting');
	let hexcode = $state('');

	let timeout: number | null;

	let selectedLetter = $state(null);
	let username: string | null = $state('');
	let submitting = $state(false);
	let submittedLetter = $state(null);

	let resultsItem = $state(null);
	let resultDefender = $state(null);

	let players = $state(null);

	let existingPositions: { top: number; left: number }[] = [];

	onMount(() => {
		try {
			if (window?.localStorage?.getItem?.('username')) {
				username = window.localStorage.getItem('username');
			}

			const roomConfig = JSON.parse(atob($page.params.configuration));

			roomId = roomConfig?.r;
			avatarType = roomConfig?.a;

			if (roomConfig?.c && roomConfig?.c?.length == 7 && roomConfig?.c?.startsWith?.('#')) {
				myshades({
					primary: roomConfig.c
				});
			}
		} catch (e) {
			console.error('Error in RoomPage', e);
		}

		if (!roomId || /^\d{3}-\d{3}$/i.test(roomId) == false) {
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

	const connect = () => {
		if (username?.trim?.() == '') {
			return toast.info($_('RoomPage.IWantYourName'));
		}

		try {
			submitting = true;
			io = ioClient(import.meta.env.VITE_BACKEND_URL);

			io.on('connect', () => {
				io.emit('join', { roomId, name: username });

				if (submittedLetter != null) {
					sendVote(submittedLetter);
				}
			});

			io.on('game-update', (payload) => {
				resultsItem = null;
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

			io.on('players', (payload) => {
				players = payload;
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
			});
		} catch (e) {
			console.error('Websocket error', e);
			toast.error($_('RoomPage.ErrorWhenJoining'));
		} finally {
			submitting = false;
		}
	};

	const sendVote = (forceValue = selectedLetter) => {
		timeout = setTimeout(() => {
			errorWhenSendingVote();
		}, 2000);

		io.send({ type: 'vote', data: { card: forceValue } }, (callback) => {
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
		return match ? `https://portail.agir.orange.com/browse/${match[0]}` : false;
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

	const formatName = (name) => {
		return name
			.trim()
			.split(/[\s.]+/)
			.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
			.join(' ');
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
			<img
				src="https://api.dicebear.com/9.x/{avatarType || 'dylan'}/svg?seed={formatName(username)}"
				alt="User-avatar"
			/>

			<input
				type="text"
				bind:value={username}
				placeholder="Jean Bon"
				disabled={submitting}
				maxlength="32"
			/>
			<button
				class:button--loading={submitting}
				aria-label="Validate your name"
				type="submit"
				disabled={submitting}
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

		{#if pokerManager.state === 'waiting'}
			<h3 class="player-count-display">
				{players?.length || 0} player{players?.length > 1 ? 's' : ''}
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
							src={(pokerManager?.avatar || 'https://api.dicebear.com/9.x/dylan/svg') +
								`?seed=${player.name}`}
						/>
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
		{:else if pokerManager.state === 'result'}
			<div class="results-container">
				<div class="results" in:fade={{ duration: 700, easing: quintInOut }}>
					<div class="header">
						<h1>{$_('RoomPage.resultsTitle')}</h1>

						{#if resultDefender}
							{#key resultDefender}
								<h3
									in:scale={{
										delay: pokerManager?.voteOnResults ? 200 : 2000,
										duration: 500,
										easing: quintInOut
									}}
								>
									<div>
										<img
											alt="User-avatar"
											src={(pokerManager?.avatar || 'https://api.dicebear.com/9.x/dylan/svg') +
												`?seed=${resultDefender.name}`}
										/>
										<span>{resultDefender.name}</span>
									</div>
									{$_('RoomPage.resultDefenderQuestion')}
									<span> {resultDefender.item}</span> ?
								</h3>
							{/key}
						{/if}
					</div>

					<div class="result">
						{#if resultsItem}
							{#if resultsItem.length == 1 && resultsItem?.[0]?.players?.length > 1}
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
										amount={200}
										fallDistance="100dvh"
									/>
								</div>
							{/if}

							{#each resultsItem as { item, players, pourcentage }, i}
								<div class="result-item">
									<ProgressBar {pourcentage} {item} delay={i} />
									<div class="players-container">
										{#each players as player}
											<span class="player">
												<img
													alt="User-avatar"
													src={(pokerManager?.avatar || 'https://api.dicebear.com/9.x/dylan/svg') +
														`?seed=${player}`}
												/>
												{player}
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

				{#if pokerManager?.voteOnResults}
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
		}
	}
</style>
