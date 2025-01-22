<script>
	import { onMount } from 'svelte';

	let pokerHistory = $state([]);
	let poker = $state(null);

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
</script>

<svelte:head>
	<title>History - Another Planning Poker</title>
	<!-- <meta
		name="description"
		content="Create a new room for your team to start a planning poker session"
	/>
	<meta
		name="og:description"
		content="Create a new room for your team to start a planning poker session"
	/>
	<meta
		name="twitter:description"
		content="Create a new room for your team to start a planning poker session"
	/> -->
</svelte:head>

<div class="history-container">
	<h1>Poker Planning History</h1>
	{#if !poker}
		{#each pokerHistory as history}
			<div class="poker-history" on:click={() => (poker = history)}>
				<p>➜ Poker for {history.team}</p>
				<span style="flex: 1"></span>
				<p>{history?.cards?.length} <i class="fa-solid fa-clipboard-question"></i></p>
				<p>{history?.history?.length} <i class="fa-solid fa-play"></i></p>
				<p>
					{`${new Date(history?.date).getHours()}`.padStart(2, '0') +
						':' +
						`${new Date(history?.date).getMinutes()}`.padStart(2, '0')} -
					{`${new Date(history?.date).getDate()}`.padStart(2, '0') +
						'/' +
						`${new Date(history?.date).getMonth() + 1}`.padStart(2, '0') +
						'/' +
						new Date(history?.date).getFullYear()} <i class="fa-solid fa-calendar-days"></i>
				</p>
			</div>
		{/each}
	{:else}
		<button on:click={() => (poker = null)}>Close</button>
		<pre>{JSON.stringify(poker, null, 2)}</pre>
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

			&:hover {
				background-color: var(--primary-400);
				border-color: var(--primary-500);
			}
		}
	}
</style>
