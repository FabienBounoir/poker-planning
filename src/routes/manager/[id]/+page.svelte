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
	import { backOut, cubicInOut, elasticInOut, elasticOut } from 'svelte/easing';
	import { fade, fly, slide, scale } from 'svelte/transition';

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

	let displayUserType = $state('PLAYERS');
	let players: Users = $state([]);
	let observers: Users = $state([]);

	let userReactions = $state(new Map());
	let reactionTimeouts = new Map();

	let viewCards = $state(null);

	let moyenne = $state(null);
	let mediane = $state(null);

	let animatePlayer = true;
	let timeoutDisableAnimation: ReturnType<typeof setTimeout> | null = null;
	let theme = '';
	let halloweenActive = $state(false);
	let halloweenEmojis = $state<Array<{ id: number; emoji: string; left: number; delay: number }>>(
		[]
	);

	const canStarVote = () => {
		if (pokerManager?.userStory == '') {
			return toast.error($_('ManagerPage.noUserStoryDefined'));
		}

		if (players && players.length < 1) {
			return toast.error($_('ManagerPage.noParticipantsForVote'));
		}

		checkTheme();

		moyenne = null;
		mediane = null;

		changeState('playing');
	};

	const checkTheme = () => {
		if (theme === 'halloween') {
			halloweenActive = true;

			const emojis = ['🎃', '👻', '🦇', '🕷️', '💀', '🕸️', '🍬', '🧙'];
			const emojiCount = 15;
			const animationDuration = 4000;
			const spawnInterval = animationDuration / emojiCount;

			let count = 0;
			const spawnEmoji = () => {
				if (count < emojiCount) {
					const newEmoji = {
						id: Date.now() + count,
						emoji: emojis[Math.floor(Math.random() * emojis.length)],
						left: Math.random() * 100,
						delay: 0
					};

					halloweenEmojis = [...halloweenEmojis, newEmoji];
					count++;

					requestAnimationFrame(() => {
						setTimeout(() => spawnEmoji(), spawnInterval);
					});
				}
			};

			// Démarrer l'apparition progressive
			spawnEmoji();

			// Nettoyer après l'animation
			setTimeout(() => {
				halloweenActive = false;
				halloweenEmojis = [];
			}, animationDuration + 2000); // Laisser le temps aux derniers émojis de terminer
		}
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

			// Nettoyer les réactions des utilisateurs qui ne sont plus présents
			const currentUserIds = new Set([...players.map((p) => p.id), ...observers.map((o) => o.id)]);

			for (const userId of userReactions.keys()) {
				if (!currentUserIds.has(userId)) {
					// Nettoyer le timeout s'il existe
					if (reactionTimeouts.has(userId)) {
						clearTimeout(reactionTimeouts.get(userId));
						reactionTimeouts.delete(userId);
					}
					userReactions.delete(userId);
				}
			}

			userReactions = new Map(userReactions);

			if (players.length > 0 && observers.length == 0) {
				displayUserType = 'PLAYERS';
			} else if (players.length == 0 && observers.length == 0) {
				displayUserType = 'PLAYERS';
			}
		});

		io.on('state', (payload) => {
			viewCards = null;
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
				viewCards = null;

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

				if (resultsItem && resultsItem?.length > 0 && players?.length > 1) {
					if (checkOnlyNumbersCards()) {
						calculMoyenne();
						calculMediane();
					} else {
						mediane = null;
						moyenne = null;
					}
				}
			}

			pokerManager = payload;
			displayUserType = 'PLAYERS';
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

		io.on('floating-reaction', (payload) => {
			if (payload?.reaction) {
				const userId = payload.reaction.id.split('-')[0];

				if (reactionTimeouts.has(userId)) {
					clearTimeout(reactionTimeouts.get(userId));
				}

				userReactions.set(userId, payload.reaction.emoji);
				// Forcer la réactivité
				userReactions = new Map(userReactions);

				const timeoutId = setTimeout(() => {
					userReactions.delete(userId);
					reactionTimeouts.delete(userId);
					// Forcer la réactivité
					userReactions = new Map(userReactions);
				}, 5000);

				reactionTimeouts.set(userId, timeoutId);
			}
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

	const calculMoyenne = () => {
		if (players && players.length > 0) {
			const total = players.reduce((acc, player) => {
				if (player.selectedCard) {
					return acc + parseInt(player.selectedCard);
				}
				return acc;
			}, 0);
			const count = players.filter((player) => player.selectedCard).length;
			moyenne = Math.round((total / count) * 100) / 100;
		} else {
			moyenne = 0;
		}
	};

	const calculMediane = () => {
		if (players && players.length > 0) {
			const selectedCards = players
				.map((player) => player.selectedCard)
				.filter((card) => card !== null)
				.sort((a, b) => a - b);

			const mid = Math.floor(selectedCards.length / 2);
			if (selectedCards.length % 2 === 0) {
				mediane = (parseInt(selectedCards[mid - 1]) + parseInt(selectedCards[mid])) / 2;
			} else {
				mediane = parseInt(selectedCards[mid]);
			}
		} else {
			mediane = 0;
		}
	};

	const checkOnlyNumbersCards = () => {
		if (pokerManager.cards) {
			return pokerManager.cards.every((card) => {
				return /^[0-9]+$/.test(card);
			});
		}
	};

	const maybe = (node, options) => {
		if (animatePlayer) {
			return options.fn(node, options);
		}
	};

	const changeDisplayUserType = (type: string) => {
		animatePlayer = false;

		timeoutDisableAnimation = setTimeout(() => {
			animatePlayer = true;
		}, 100);

		displayUserType = type;
	};

	onMount(() => {
		const today = new Date();
		if (today.getMonth() === 9 && today.getDate() >= 20) {
			theme = 'halloween';
		}

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

		// Nettoyer tous les timeouts de réactions
		for (const timeoutId of reactionTimeouts.values()) {
			clearTimeout(timeoutId);
		}
		reactionTimeouts.clear();
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

<!-- Effet Halloween spectaculaire -->
{#if halloweenActive}
	<div class="halloween-overlay" transition:fade={{ duration: 300 }}>
		{#each halloweenEmojis as emoji (emoji.id)}
			<div
				class="halloween-emoji"
				style="left: {emoji.left}%; top: 110%;"
				in:scale={{ duration: 200, start: 0.3 }}
				out:fade={{ duration: 300 }}
			>
				{emoji.emoji}
			</div>
		{/each}
	</div>
{/if}

<main class:halloween-mode={halloweenActive}>
	{#if editRoom}
		<div class="manager">
			<EditConfiguration bind:editRoom {pokerManager} {deleteRoom} {updateRoom} />
		</div>
	{:else}
		<div class="manager">
			<div class="container">
				<h1>
					<span in:fly|local={{ easing: backOut, x: -25 }}>Poker Planning</span>
				</h1>

				<div class="me">
					{$_('ManagerPage.welcomeMessage', { values: { USER: pokerManager.team || '' } })}
				</div>

				<Code code={roomId} {url} hexcode={pokerManager?.hexcode} />
			</div>

			<label for="userStory">{$_('ManagerPage.userStoryLabel')}</label>
			<div class="container-info">
				<TextArea
					bind:value={pokerManager.userStory}
					disabled={pokerManager.state == 'result' || pokerManager.state == 'waiting'}
					minRows={1}
					maxRows={10}
					placeholder="ManagerPage.textareaPlaceholder"
				/>
				{#if moyenne || mediane}
					<div
						class="stats-label"
						transition:slide={{ axis: 'y', duration: 300, delay: 0, easing: cubicInOut }}
					>
						{#if moyenne}
							<span>
								{$_('ManagerPage.moyenneLabel')}:
								{moyenne}
							</span>
						{/if}

						{#if mediane}
							<span>
								{$_('ManagerPage.medianeLabel')}:
								{mediane}
							</span>
						{/if}
					</div>
				{/if}
			</div>

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
							on:click={() => {
								if (viewCards == item) {
									viewCards = null;
								} else {
									viewCards = item;
								}
							}}
							class:active={viewCards == item}
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
			<div class="header" in:fade={{ duration: 3000, delay: 200, easing: elasticOut }}>
				<div class="button-user-type-container">
					<div
						class="player"
						class:active={displayUserType == 'PLAYERS'}
						on:click={() => changeDisplayUserType('PLAYERS')}
					>
						<i class="fa-solid fa-user"></i>
						{players.length || 0}
					</div>
					{#if observers?.length > 0}
						<div
							class="observer"
							class:active={displayUserType == 'OBSERVERS'}
							on:click={() => changeDisplayUserType('OBSERVERS')}
						>
							<i class="fa-solid fa-eye"></i>
							{observers.length || 0}
						</div>
					{/if}
				</div>
			</div>

			{#if players?.length < 1 && displayUserType == 'PLAYERS'}
				<div class="no-participants">
					<p class="tooltip">{$_('ManagerPage.noParticipantsMessage')}</p>
				</div>
			{/if}

			{#each displayUserType == 'PLAYERS' ? players : observers as user (user.id)}
				<div
					class="user"
					class:defender={resultDefender?.name == user?.name &&
						resultDefender?.item == user?.selectedCard}
					out:maybe={{ fn: slide, axis: 'y', duration: 300, delay: 0, easing: cubicInOut }}
					in:maybe={{ fn: slide, axis: 'x', duration: 500, delay: 0, easing: cubicInOut }}
					class:Lowlight={viewCards != null &&
						viewCards != user?.selectedCard &&
						pokerManager.state == 'result'}
				>
					<div class="profile">
						<div class="image-container">
							<img
								alt={'avatar for ' + user.name}
								src={user?.avatar ||
									(pokerManager?.avatar || 'https://api.dicebear.com/9.x/dylan/svg') +
										`?seed=${user.name}`}
							/>
							{#if userReactions.get(user.id)}
								<div
									class="user-reaction-overlay"
									title="Réaction actuelle"
									in:scale={{ duration: 400, start: 0.5, opacity: 0 }}
									out:scale={{ duration: 200, start: 0.8, opacity: 0 }}
								>
									<span class="reaction-emoji">
										{userReactions.get(user.id)}
									</span>
								</div>
							{/if}
						</div>
						<div class="user-name-container">
							<h2>{user.name}</h2>
						</div>
						{#if user?.firstVoter && pokerManager.state == 'result' && displayUserType == 'PLAYERS'}
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

						{#if user?.mostChanging && pokerManager.state == 'result' && displayUserType == 'PLAYERS'}
							<Tooltip
								title={$_('ManagerPage.mostChangingVoterTooltip', {
									values: { count: user.voteCount }
								})}
							>
								<svg
									width="22"
									height="22"
									viewBox="0 0 17 17"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M16.212 1.68336C16.2103 1.54848 16.1352 1.4232 16.014 1.36248C15.8933 1.30032 15.7483 1.3116 15.6377 1.38984L14.2111 2.41272L14.0988 2.49336C12.5616 0.95952 10.4518 0 8.11369 0C4.92553 0 2.14297 1.76496 0.687847 4.36824L0.693607 4.37136C0.562087 4.65528 0.663847 4.99704 0.939847 5.1564L0.940327 5.15664L2.89297 6.28392C3.18529 6.45288 3.55945 6.3528 3.72817 6.06024C3.72961 6.0576 3.73033 6.05472 3.73177 6.05208C4.59361 4.51512 6.23689 3.4728 8.12113 3.4728C9.29209 3.4728 10.3656 3.87984 11.2205 4.5528L10.9802 4.72536L9.55273 5.74824C9.44353 5.82672 9.38569 5.96184 9.40609 6.09552C9.42553 6.22944 9.51913 6.34224 9.64801 6.38544L15.7553 8.466C15.8659 8.50488 15.9871 8.48616 16.0834 8.41728C16.1791 8.34768 16.2343 8.23824 16.2338 8.12208L16.212 1.68336Z"
										fill="black"
									/>
									<path
										d="M15.294 10.8965L15.2935 10.8962L13.3409 9.76896C13.0486 9.6 12.6744 9.70008 12.5057 9.99264C12.5042 9.99528 12.5035 9.99816 12.5021 10.0008C11.6402 11.5378 9.99696 12.5801 8.11272 12.5801C6.94176 12.5801 5.86824 12.173 5.01336 11.5001L5.2536 11.3275L6.68112 10.3046C6.79032 10.2262 6.84816 10.091 6.82776 9.95736C6.80832 9.82344 6.71472 9.71064 6.58584 9.66744L0.478563 7.58688C0.367923 7.548 0.246723 7.56672 0.150483 7.6356C0.0547228 7.7052 -0.000476895 7.81464 3.10467e-06 7.9308L0.0220829 14.3695C0.0237629 14.5044 0.0988831 14.6297 0.220083 14.6904C0.340803 14.7526 0.485763 14.7413 0.596403 14.663L2.02296 13.6402L2.13528 13.5595C3.67248 15.0934 5.78232 16.0529 8.1204 16.0529C11.3086 16.0529 14.0911 14.2879 15.5462 11.6846L15.5402 11.6818C15.6718 11.3976 15.5702 11.0561 15.294 10.8965Z"
										fill="black"
									/>
								</svg>
							</Tooltip>
						{/if}

						{#if user?.slowest && pokerManager.state == 'result' && displayUserType == 'PLAYERS'}
							<Tooltip title={$_('ManagerPage.slowestVoterTooltip')}>
								<svg
									fill="#000000"
									height="22px"
									width="22px"
									version="1.1"
									id="Layer_1"
									xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink"
									viewBox="0 0 512 512"
									xml:space="preserve"
								>
									<g>
										<g>
											<path
												d="M466.912,167.796v-82.72c0-13.774,11.205-24.98,24.98-24.98V19.881c-35.948,0-65.195,29.246-65.195,65.195v69.289
			c-2.94-0.278-5.914-0.434-8.925-0.434c-2.745,0-5.455,0.143-8.141,0.374V85.076c0-35.948-29.246-65.195-65.194-65.195v40.215
			c13.772,0,24.979,11.205,24.979,24.98v82.28c-27.452,16.481-45.873,46.518-45.873,80.803v51.746
			c-11.807,3.791-29.337,10.672-51.56,22.919c-5.355,32.645-21.877,62.065-47.321,83.801c-25.65,21.913-57.596,33.659-90.969,33.659
			c-3.728,0-7.472-0.146-11.229-0.441c-31.616-2.485-61.3-13.162-86.671-30.791c-10.55,14.05-19.778,34.474-19.778,62.961v20.107
			h392.384C465.525,492.119,512,445.644,512,388.52V248.159C511.999,214.196,493.933,184.38,466.912,167.796z"
											/>
										</g>
									</g>
									<g>
										<g>
											<path
												d="M197.422,84.923c-48.785-3.83-96.143,11.558-133.35,43.344C26.865,160.052,4.263,204.425,0.429,253.208
			c-2.853,36.291,8.598,71.521,32.243,99.198c23.645,27.679,56.652,44.493,92.942,47.342c26.683,2.102,52.58-6.32,72.927-23.704
			c20.347-17.382,32.708-41.647,34.805-68.328c3.13-39.814-26.716-74.753-66.532-77.882c-13.598-1.071-26.802,3.221-37.173,12.083
			c-10.371,8.862-16.673,21.231-17.742,34.832l-40.092-3.153c1.912-24.309,13.173-46.419,31.714-62.256
			c18.54-15.839,42.145-23.504,66.446-21.598c20.941,1.648,40.098,8.965,56.109,20.309c22.677,16.065,39.015,40.223,45.092,67.887
			c4.223-2.052,8.286-3.936,12.158-5.64v-24.142c0-29.082,9.303-56.021,25.061-78.043c5.973-8.346,12.869-15.985,20.549-22.76
			C296.937,110.256,252.773,89.272,197.422,84.923z"
											/>
										</g>
									</g>
								</svg>
							</Tooltip>
						{/if}
					</div>
					{#if pokerManager.state === 'playing' && displayUserType == 'PLAYERS'}
						<Valided valided={user.selectedCard != null} />
					{:else if pokerManager.state === 'result' && displayUserType == 'PLAYERS'}
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
			box-sizing: border-box;

			span {
				display: flex;
				flex-direction: row;
				gap: 0.7em;
				color: var(--primary-900);
				align-items: center;
				justify-content: center;
				background-color: var(--primary-200);
				padding: 0.3em 0.8em;
				border-radius: 0.5em;
				font-size: 1em;
				cursor: pointer;
				border: 3px solid transparent;

				&.active {
					background-color: var(--primary-300);
					border: 3px solid var(--primary-700);
				}

				h3 {
					font-size: 1.3em;
					font-weight: 800;
				}
			}
		}

		.manager {
			padding: 5vw 5vw 0 5vw;
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

			.container-info {
				display: flex;
				flex-direction: column;
				gap: 0;
				background-color: var(--primary-200);
				border-radius: 0.5rem;
				max-width: 95vw;

				.stats-label {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;

					span {
						color: var(--primary-950);
						padding: 0.2em 0.5em;
					}
				}
			}

			.buttons {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				gap: 1em;
				margin-top: 2em;

				button {
					background-color: var(--primary-400);
				}

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

			.tooltip {
				text-align: center;
				padding-top: 2em;
			}

			.header {
				display: flex;
				position: sticky;
				top: 0;
				padding-bottom: 0.5em;
				margin-bottom: 0.5em;
				padding-top: 1em;
				z-index: 50;
				background-color: var(--primary-50);

				.button-user-type-container {
					display: flex;
					flex-direction: row;
					border-radius: 5px;
					overflow: hidden;

					> div {
						cursor: pointer;
						padding: 0.2em 0.5em;
						background-color: var(--primary-100);
						color: var(--primary-950);
						transition: background-color 0.3s ease-in-out;
						display: flex;
						align-items: center;
						flex-wrap: nowrap;
						gap: 0.5em;
						align-items: center;
						justify-content: center;
						font-weight: bold;

						&.active {
							background-color: var(--primary-400);
							color: var(--primary-950);
							filter: brightness(1);
						}

						&:hover {
							background-color: var(--primary-500);
							color: var(--primary-950);
							filter: brightness(1);
						}
					}
				}
			}

			.user {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				min-height: 3.5em;
				padding: 0 1em;
				margin-bottom: 1em;
				border-radius: 5px;
				background-color: var(--primary-200);
				font-weight: 600;
				color: var(--primary-950);
				box-sizing: border-box;

				&.Lowlight {
					opacity: 0.5;
				}

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

					.user-name-container {
						display: flex;
						align-items: center;
						gap: 0.5em;
						flex-wrap: wrap;
					}

					@keyframes reactionBounce {
						0%,
						80%,
						100% {
							transform: scale(1) rotate(0deg);
						}
						10% {
							transform: scale(1.2) rotate(5deg);
						}
						20% {
							transform: scale(1.1) rotate(-3deg);
						}
						30% {
							transform: scale(1.15) rotate(2deg);
						}
						40% {
							transform: scale(1) rotate(0deg);
						}
					}

					svg {
						path {
							fill: var(--primary-950);
						}
					}

					h2 {
						max-width: 30vw;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.image-container {
						position: relative;
						width: 40px;
						height: 40px;

						img {
							border-radius: 100%;
							border: 2px solid var(--primary-700);
							min-width: 40px;
							min-height: 40px;
							max-width: 40px;
							max-height: 40px;
							object-fit: cover;
						}

						.user-reaction-overlay {
							position: absolute;
							left: 50%;
							top: 50%;
							transform: translate(-50%, -50%);
							display: flex;
							align-items: center;
							justify-content: center;
							min-width: 40px;
							height: 40px;
							border-radius: 50%;
							z-index: 10;

							.reaction-emoji {
								font-size: 1.6em;
								display: flex;
								align-items: center;
								justify-content: center;
								animation: reactionBounce 3s ease-in-out infinite;
								transform-origin: center;
							}

							&::before {
								content: '';
								position: absolute;
								top: -2px;
								left: -2px;
								right: -2px;
								bottom: -2px;
								border-radius: 50%;
								background: color-mix(in srgb, var(--primary-800) 20%, transparent);
								backdrop-filter: blur(1px);
								z-index: -1;
							}
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

				p {
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

				.user {
					.profile {
						h2 {
							max-width: 50vw;
						}
					}
				}
			}

			.manager {
				max-height: none;
				padding: 0;

				.container {
					padding: 3rem 0 2rem 0;

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
		h1 {
			color: var(--primary-100);
		}

		.me {
			color: var(--primary-200);
		}

		label {
			color: var(--primary-50);
		}

		.buttons {
			button {
				background-color: var(--primary-400);
			}
		}

		main {
			.resultDescription {
				span {
					background-color: var(--primary-700);
					color: var(--primary-100);

					&.active {
						background-color: var(--primary-700);
						border: 3px solid var(--primary-100);
					}
				}
			}

			.information {
				.tooltip {
					color: var(--primary-50);
				}
				.header {
					color: var(--primary-50);
					background-color: var(--primary-950);

					.button-user-type-container {
						> div {
							background-color: var(--primary-950);
							color: var(--primary-200);
							filter: brightness(0.7);

							&.active {
								background-color: var(--primary-400);
								color: var(--primary-950);
								filter: brightness(1);
							}

							&:hover {
								background-color: var(--primary-300);
								color: var(--primary-950);
								filter: brightness(1);
							}
						}
					}
				}
			}

			.manager {
				p {
					color: var(--primary-100);
				}

				.container-info {
					display: flex;
					flex-direction: column;
					gap: 0;
					background-color: var(--primary-900);
					border-radius: 0.5rem;

					.stats-label {
						span {
							color: var(--primary-50);
							padding: 0.2em 0.5em;
						}
					}
				}

				.user {
					background-color: var(--primary-500);

					&.defender {
						box-shadow: 0 0 5px var(--primary-300);

						@keyframes breathing {
							0% {
								box-shadow: 0 0 0 5px var(--primary-500);
							}
							50% {
								box-shadow: 0 0 0 1px var(--primary-500);
							}
							100% {
								box-shadow: 0 0 0 5px var(--primary-500);
							}
						}
					}

					.profile {
						.user-reaction-overlay {
							background: linear-gradient(135deg, var(--primary-800), var(--primary-700));
							border: 2px solid var(--primary-500);
							box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

							&::before {
								background: linear-gradient(
									45deg,
									var(--primary-500),
									var(--primary-300),
									var(--primary-500)
								);
							}
						}

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

	/* ===== ANIMATIONS HALLOWEEN SPECTACULAIRES ===== */

	/* Overlay avec effet de brume */
	.halloween-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 9999;
		background: radial-gradient(
			ellipse at center,
			rgba(255, 102, 0, 0.1) 0%,
			rgba(153, 0, 255, 0.15) 50%,
			rgba(0, 0, 0, 0.3) 100%
		);
		animation: halloweenPulse 2s ease-in-out infinite;
	}

	@keyframes halloweenPulse {
		0%,
		100% {
			opacity: 0.6;
		}
		50% {
			opacity: 0.9;
		}
	}

	/* Émojis volants */
	.halloween-emoji {
		position: absolute;
		font-size: 3rem;
		animation: floatUp 4s ease-out forwards;
		filter: drop-shadow(0 0 10px rgba(255, 102, 0, 0.8));
		user-select: none;
	}

	@keyframes floatUp {
		0% {
			top: 110%;
			transform: rotate(0deg) scale(0.5);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			top: -10%;
			transform: rotate(360deg) scale(1.2);
			opacity: 0;
		}
	}

	/* Mode Halloween pour le main */
	main.halloween-mode {
		animation:
			halloweenShake 0.5s ease-in-out,
			halloweenGlow 2s ease-in-out;

		.manager {
			animation: cardsPulse 2s ease-in-out;

			.container {
				h1 {
					animation: titleGlow 1.5s ease-in-out;
					text-shadow:
						0 0 10px rgba(255, 102, 0, 0.8),
						0 0 20px rgba(255, 102, 0, 0.6),
						0 0 30px rgba(153, 0, 255, 0.4);
				}
			}

			button {
				animation: buttonPulse 1s ease-in-out;
			}
		}

		.users {
			.user {
				animation: userFloat 2s ease-in-out;
			}
		}
	}

	@keyframes halloweenShake {
		0%,
		100% {
			transform: translateX(0);
		}
		10%,
		30%,
		50%,
		70%,
		90% {
			transform: translateX(-5px);
		}
		20%,
		40%,
		60%,
		80% {
			transform: translateX(5px);
		}
	}

	@keyframes halloweenGlow {
		0% {
			filter: brightness(1);
		}
		25% {
			filter: brightness(1.3) hue-rotate(15deg);
		}
		50% {
			filter: brightness(1.1) hue-rotate(-15deg);
		}
		75% {
			filter: brightness(1.3) hue-rotate(15deg);
		}
		100% {
			filter: brightness(1);
		}
	}

	@keyframes cardsPulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}

	@keyframes titleGlow {
		0%,
		100% {
			text-shadow:
				0 0 5px rgba(255, 102, 0, 0.5),
				0 0 10px rgba(255, 102, 0, 0.3);
		}
		50% {
			text-shadow:
				0 0 20px rgba(255, 102, 0, 1),
				0 0 40px rgba(255, 102, 0, 0.8),
				0 0 60px rgba(153, 0, 255, 0.6);
		}
	}

	@keyframes buttonPulse {
		0%,
		100% {
			transform: scale(1);
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		}
		25% {
			transform: scale(1.05);
			box-shadow:
				0 0 20px rgba(255, 102, 0, 0.6),
				0 0 40px rgba(255, 102, 0, 0.3);
		}
		75% {
			transform: scale(1.05);
			box-shadow:
				0 0 20px rgba(153, 0, 255, 0.6),
				0 0 40px rgba(153, 0, 255, 0.3);
		}
	}

	@keyframes userFloat {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
</style>
