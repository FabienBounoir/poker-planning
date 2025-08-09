<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { scale } from 'svelte/transition';

	let { players, observers, pokerAvatarType, DEFAUT_AVATAR_URL } = $props();

	let existingPositions: { top: number; left: number }[] = [];

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
</script>

<h3 class="player-count-display">
	{players && players.length > 0 ? `${players.length} player${players.length > 1 ? 's' : ''}` : ''}
	{players && players.length > 0 && observers && observers.length > 0 ? ' + ' : ''}
	{observers && observers.length > 0
		? `${observers?.length} observer${observers.length > 1 ? 's' : ''}`
		: ''}
</h3>

<div class="waiting-message">
	<h1>{$_('RoomPage.waitingForVotes')}</h1>
	<div class="loading-dots">
		<span class="dot dot-1">.</span>
		<span class="dot dot-2">.</span>
		<span class="dot dot-3">.</span>
	</div>
</div>

{#if players}
	{#each players as player}
		<div class="player-display" style={getRandomPosition()} transition:scale={{ duration: 500 }}>
			<img
				alt="User-avatar"
				src={player?.avatar || (pokerAvatarType || DEFAUT_AVATAR_URL) + `?seed=${player.name}`}
			/>
			<span>{player.name}</span>
		</div>
	{/each}
{/if}

<style lang="scss">
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
			min-width: 50px;
			min-height: 50px;
			max-width: 50px;
			max-height: 50px;
			object-fit: cover;
			pointer-events: none;
		}
	}

	.waiting-message {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5em;

		h1 {
			margin: 0;
			text-align: center;
		}
	}

	.loading-dots {
		display: flex;
		gap: 0.2em;
		align-items: center;
		justify-content: center;
	}

	.dot {
		font-size: 2em;
		font-weight: bold;
		color: var(--primary-600);
		animation: dotPulse 1.5s infinite ease-in-out;
		opacity: 0.4;

		&.dot-1 {
			animation-delay: 0s;
		}

		&.dot-2 {
			animation-delay: 0.3s;
		}

		&.dot-3 {
			animation-delay: 0.6s;
		}
	}

	@keyframes dotPulse {
		0%,
		60%,
		100% {
			opacity: 0.4;
			transform: scale(1);
		}
		30% {
			opacity: 1;
			transform: scale(1.2);
		}
	}

	@media (prefers-color-scheme: dark) {
		h1 {
			color: var(--primary-100);
		}

		.dot {
			color: var(--primary-400);
		}

		.player-count-display {
			color: var(--primary-300);
		}

		.player-display {
			color: var(--primary-400);

			img {
				background-color: var(--primary-800);
			}
		}
	}
</style>
