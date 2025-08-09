<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	interface Props {
		cards: string[];
		selectedLetter: string | null;
		submittedLetter: string | null;
		sendVote: () => void;
	}

	let { cards, selectedLetter = $bindable(), submittedLetter, sendVote }: Props = $props();

	let isExpanded = $state(false);
</script>

<!-- Bouton fixe en bas pour déplier -->
<div class="mobile-voting-container">
	<button
		class="toggle-button"
		class:expanded={isExpanded}
		onclick={() => (isExpanded = !isExpanded)}
	>
		<span class="toggle-text">
			{isExpanded ? $_('RoomPage.hideVoting') : $_('RoomPage.quickVote')}
		</span>
		<span class="toggle-icon" class:rotated={isExpanded}>▲</span>
	</button>

	{#if isExpanded}
		<div class="voting-panel" transition:slide={{ duration: 300, easing: quintOut }}>
			<div class="voting-grid">
				{#each cards as card}
					<button
						class="vote-card"
						class:selected={selectedLetter === card}
						class:submitted={submittedLetter === card}
						onclick={() => {
							if (selectedLetter === card) {
								selectedLetter = null;
							} else {
								selectedLetter = card;
							}
							sendVote();
						}}
					>
						{card}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.mobile-voting-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background-color: var(--primary-50);
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.toggle-button {
		width: 100%;
		padding: 1rem;
		background-color: var(--primary-600);
		color: var(--primary-100);
		border: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: 600;
		font-size: 1.1rem;
		cursor: pointer;
		transition: all 0.3s ease;

		&:hover {
			background-color: var(--primary-700);
		}

		&.expanded {
			background-color: var(--primary-700);
		}
	}

	.toggle-icon {
		transition: transform 0.3s ease;
		font-size: 1.2rem;

		&.rotated {
			transform: rotate(180deg);
		}
	}

	.voting-panel {
		padding: 1.5rem;
		background-color: var(--primary-50);
		max-height: 50vh;
		overflow-y: auto;
	}

	.voting-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
		gap: 1rem;
		max-width: 100%;
	}

	.vote-card {
		background-color: var(--primary-200);
		border: 2px solid var(--primary-400);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.3rem;
		color: var(--primary-700);
		cursor: pointer;
		transition: all 0.3s ease;
		min-height: 60px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

		&:hover {
			transform: translateY(-2px);
			background-color: var(--primary-300);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		}

		&.selected {
			background-color: var(--primary-500);
			border-color: var(--primary-700);
			color: var(--primary-100);
			transform: translateY(-2px);
		}

		&.submitted {
			background-color: var(--primary-700);
			color: var(--primary-100);
			border-color: var(--primary-900);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		}
	}

	/* Dark mode */
	@media (prefers-color-scheme: dark) {
		.mobile-voting-container {
			background-color: var(--primary-900);
			box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
		}

		.toggle-button {
			background-color: var(--primary-700);
			color: var(--primary-100);

			&:hover {
				background-color: var(--primary-600);
			}

			&.expanded {
				background-color: var(--primary-600);
			}
		}

		.voting-panel {
			background-color: var(--primary-900);
		}

		.vote-card {
			background-color: var(--primary-800);
			border-color: var(--primary-600);
			color: var(--primary-200);
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

			&:hover {
				background-color: var(--primary-700);
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
			}

			&.selected {
				background-color: var(--primary-600);
				border-color: var(--primary-400);
				color: var(--primary-100);
			}

			&.submitted {
				background-color: var(--primary-500);
				color: var(--primary-100);
				border-color: var(--primary-300);
			}
		}
	}

	/* Masquer sur desktop */
	@media (min-width: 768px) {
		.mobile-voting-container {
			display: none;
		}
	}
</style>
