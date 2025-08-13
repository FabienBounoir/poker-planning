<script>
	import { fade } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { quintOut } from 'svelte/easing';
	import Card from './Card.svelte';

	let {
		cards,
		isObserver,
		selectedLetter = $bindable(),
		submittedLetter = $bindable(),
		sendVote = () => {}
	} = $props();
</script>

{#if isObserver}
	<div class="observer-animation">
		<div class="cards-animation">
			<div class="card-animate card-1"></div>
			<div class="card-animate card-2"></div>
			<div class="card-animate card-3"></div>
		</div>
		<span>{$_('RoomPage.voteInProgress')}</span>
	</div>
{:else}
	<div class="flex" in:fade={{ duration: 500, easing: quintOut }}>
		{#each cards as card}
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

<style lang="scss">
	.observer-animation {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
	}

	.cards-animation {
		display: flex;
		gap: 1em;
		justify-content: center;
		align-items: center;
	}

	.card-animate {
		width: 60px;
		height: 90px;
		background-color: var(--primary-200);
		border: 1px solid #ddd;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		position: relative;
		transform-style: preserve-3d;
		animation: cardFlip 2s infinite ease-in-out;
		display: flex;
		align-items: center;
		justify-content: center;

		&::before {
			color: var(--primary-600);
			font-size: 1.5em;
			font-weight: bold;
		}

		&.card-1::before {
			content: '♠';
		}

		&.card-2::before {
			content: '♥';
		}

		&.card-3::before {
			content: '♦';
		}

		&.card-1 {
			animation-delay: 0s;
		}

		&.card-2 {
			animation-delay: 0.3s;
		}

		&.card-3 {
			animation-delay: 0.6s;
		}
	}

	@keyframes cardFlip {
		0%,
		20% {
			transform: rotateY(0deg) scale(1);
		}
		50% {
			transform: rotateY(180deg) scale(1.1);
		}
		80%,
		100% {
			transform: rotateY(360deg) scale(1);
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

	@media screen and (max-width: 1100px) {
		.flex {
			max-width: 100vw;
		}
	}

	@media screen and (max-width: 500px) {
		.flex {
			display: flex;
			flex-direction: column;
			gap: 1em;
			flex-wrap: wrap;
			justify-content: center;
		}

		.card-animate {
			width: 50px;
			height: 75px;
		}
	}

	@media (prefers-color-scheme: dark) {
		.observer-animation span {
			color: var(--primary-100);
		}

		.card-animate {
			background-color: var(--primary-800);
			border-color: #333;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

			&::before {
				color: var(--primary-200);
			}
		}
	}
</style>
