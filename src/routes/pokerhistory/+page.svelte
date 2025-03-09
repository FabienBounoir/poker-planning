<script lang="ts">
	import type { PokerManager } from '$lib/components/types/PokerManager';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	let pokerHistory: PokerManager[] = $state([]);
	let poker: PokerManager | null = $state(null);

	onMount(() => {
		const sortedHistoryKeys = getSortedHistoryKeys();

		pokerHistory = sortedHistoryKeys.map((key) => {
			return JSON.parse(localStorage.getItem(key));
		});
	});

	const getSortedHistoryKeys = () => {
		const allKeys = Object.keys(localStorage);

		const historyKeys = allKeys.filter((key) => key.startsWith('PP_HISTORY_'));

		const sortedKeys = historyKeys.sort((a, b) => {
			const dateA = new Date(a.replace('PP_HISTORY_', ''));
			const dateB = new Date(b.replace('PP_HISTORY_', ''));
			return dateB - dateA;
		});

		return sortedKeys;
	};

	const setPoker = (history: PokerManager) => {
		poker = history;
		window.scrollTo(0, 0);
	};
</script>

<svelte:head>
	<title>History - Another Planning Poker</title>
</svelte:head>

<div class="history-container">
	<h1>{$_('history.title')}</h1>

	{#if pokerHistory.length === 0}
		<h2>{$_('history.noHistory')}</h2>
		<p>{$_('history.startSession')}</p>
	{/if}

	{#if !poker}
		{#each pokerHistory as history}
			<div class="poker-history" on:click={() => setPoker(history)}>
				<p>➜ {$_('history.pokerFor', { values: { team: history.team } })}</p>
				<span style="flex: 1"></span>
				<p class="cards">{history?.cards?.length} <i class="fa-solid fa-clipboard-question"></i></p>
				<p class="plays">{history?.history?.length} <i class="fa-solid fa-play"></i></p>
				<p>
					{$_('history.dateFormat', {
						values: {
							hour: `${new Date(history?.date).getHours()}`.padStart(2, '0'),
							minute: `${new Date(history?.date).getMinutes()}`.padStart(2, '0'),
							day: `${new Date(history?.date).getDate()}`.padStart(2, '0'),
							month: `${new Date(history?.date).getMonth() + 1}`.padStart(2, '0'),
							year: new Date(history?.date).getFullYear()
						}
					})}
					<i class="fa-solid fa-calendar-days"></i>
				</p>
			</div>
		{/each}
	{:else}
		<div class="poker-history" on:click={() => (poker = null)}>
			<p>➜ {$_('history.pokerFor', { values: { team: poker.team } })}</p>
			<span style="flex: 1"></span>
			<p class="cards">{poker?.cards?.length} <i class="fa-solid fa-clipboard-question"></i></p>
			<p class="plays">{poker?.history?.length} <i class="fa-solid fa-play"></i></p>
			<p>
				{$_('history.dateFormat', {
					values: {
						hour: `${new Date(poker?.date).getHours()}`.padStart(2, '0'),
						minute: `${new Date(poker?.date).getMinutes()}`.padStart(2, '0'),
						day: `${new Date(poker?.date).getDate()}`.padStart(2, '0'),
						month: `${new Date(poker?.date).getMonth() + 1}`.padStart(2, '0'),
						year: new Date(poker?.date).getFullYear()
					}
				})} <i class="fa-solid fa-calendar-days"></i>
			</p>
		</div>

		{#each poker.history as play, index}
			<div class="play-container">
				<div class="story">
					<h2>{play.story || `Story ${index + 1}`}</h2>
				</div>
				<div class="results-container">
					<div class="winner">
						<h3>{play.winner}</h3>
					</div>
					<div class="result-container">
						<div class="result">
							{#each play.results as result}
								<p>
									<img
										src="https://api.dicebear.com/9.x/dylan/svg?seed={result.name}"
										alt={result.name}
									/>
									{result.name} - {result.card}
								</p>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style lang="scss">
	.history-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
		margin: 2em 0;
		min-height: 100dvh;

		h1 {
			font-size: 2em;
			color: var(--primary-950);
			height: 35vh;
			align-items: center;
			justify-content: center;
			display: flex;
		}

		.play-container {
			width: 75vw;
			border-radius: 0.5em;
			background-color: var(--primary-500);
			overflow: hidden;
			.story {
				background-color: var(--primary-400);
				color: var(--primary-950);
				h2 {
					font-size: 1.5em;
					padding: 0.5em;
				}
			}
			.results-container {
				display: flex;
				flex-direction: row;
				.result-container {
					display: flex;
					align-items: center;
					justify-content: left;
					padding: 0.5em;
				}
				.result {
					border-radius: 0.5em;
					color: var(--primary-950);
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					align-items: center;
					gap: 1em;
					p {
						display: flex;
						flex-wrap: nowrap;
						background-color: var(--primary-400);
						border-radius: 0.5em;
						padding: 0.5em;
						align-items: center;
						gap: 0.5em;

						img {
							width: 2em;
							height: 2em;
							border-radius: 50%;
						}
					}
				}
				.winner {
					background-color: var(--primary-600);
					max-width: 10vw;
					min-width: 10vw;
					color: var(--primary-950);
					display: flex;
					align-items: center;
					justify-content: center;
					h3 {
						font-size: 4em;
					}
				}
			}
		}

		.poker-history {
			gap: 2em;
			display: flex;
			flex-direction: row;
			width: 75vw;
			background-color: var(--primary-500);
			border: 3px solid transparent;
			border-radius: 0.5em;
			padding: 1em;
			cursor: pointer;
			color: var(--primary-950);
			transition:
				border-color 0.3s,
				background-color 0.3s;
			align-items: center;

			&:hover {
				background-color: var(--primary-400);
				border-color: var(--primary-500);
			}
		}
	}

	@media (max-width: 950px) {
		.history-container {
			h1 {
				font-size: 1.5em;
			}

			.poker-history {
				width: 90vw;
			}

			.play-container {
				width: 90vw;

				.results-container {
					.winner {
						max-width: 15vw;
						min-width: 15vw;
						h3 {
							font-size: 2em;
						}
					}

					.result {
						gap: 0.5em;
					}
				}
			}
		}
	}

	@media (max-width: 600px) {
		.history-container {
			h1 {
				font-size: 1.2em;
			}

			.poker-history {
				flex-direction: row;
				justify-content: space-between;
				span {
					display: none;
				}
				.cards,
				.plays {
					display: none;
				}
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		.history-container {
			h1 {
				color: var(--primary-200);
			}

			.poker-history {
				background-color: var(--primary-700);
				color: var(--primary-200);
				border-color: var(--primary-500);

				&:hover {
					background-color: var(--primary-600);
				}
			}

			.play-container {
				background-color: var(--primary-800);
				.story {
					background-color: var(--primary-700);
					color: var(--primary-200);
				}
				.results-container {
					.result {
						color: var(--primary-200);
						p {
							background-color: var(--primary-700);
						}
					}
					.winner {
						background-color: var(--primary-900);
						color: var(--primary-200);
					}
				}
			}
		}
	}
</style>
