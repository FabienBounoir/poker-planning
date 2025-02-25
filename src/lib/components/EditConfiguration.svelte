<script>
	import Switch from './Switch.svelte';
	import { onMount } from 'svelte';
	import { backOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	let { editRoom = $bindable(), pokerManager } = $props();

	let configuration = $state({
		avatar: 'https://api.dicebear.com/9.x/dylan/svg',
		autoReveal: false,
		voteOnResults: false,
		type: 'room',
		cards: undefined
	});

	let choices = $state([
		{ id: 'TSHIRT', text: $_('selectCategories.types.TSHIRT') },
		{ id: 'FIBONACCI', text: $_('selectCategories.types.FIBONACCI') },
		{ id: 'POWEROF2', text: $_('selectCategories.types.POWEROF2') },
		{ id: 'SEQUENTIAL', text: $_('selectCategories.types.SEQUENTIAL') },
		{ id: 'TSHIRT_HALF', text: $_('selectCategories.types.TSHIRT_HALF') }
	]);

	onMount(() => {
		configuration.avatar = pokerManager.avatar;
		configuration.autoReveal = pokerManager.autoReveal;
		configuration.voteOnResults = pokerManager.voteOnResults;
		configuration.type = pokerManager.type;
		configuration.cards = pokerManager.cards;
		console.log(pokerManager);

		const getCustomDeck = Object.keys(window.localStorage).filter((key) =>
			key.startsWith('CUSTOM-')
		);

		if (getCustomDeck?.length > 0) {
			for (let i = 0; i < getCustomDeck.length; i++) {
				const element = window.localStorage.getItem(getCustomDeck[i]);
				if (!element) continue;

				const customDeck = JSON.parse(element);
				choices.push({
					id: getCustomDeck[i],
					text: `${customDeck.name} (${customDeck.cards.join(', ')})`,
					cards: customDeck.cards
				});
			}
		}
	});

	const avatarUrl = [
		'https://api.dicebear.com/9.x/adventurer/svg',
		'https://api.dicebear.com/9.x/avataaars/svg',
		'https://api.dicebear.com/9.x/dylan/svg',
		'https://api.dicebear.com/9.x/miniavs/svg',
		'https://api.dicebear.com/9.x/personas/svg'
	];

	const seed = 'bouns';
</script>

<main>
	<h2 in:fly|local={{ easing: backOut, x: -25 }}>Edit Configuration</h2>

	<div class="avatar-container">
		{#each avatarUrl as url}
			<img
				src={url + `?seed=${seed}`}
				alt="avatar"
				class:selected={configuration.avatar === url}
				on:click={() => (configuration.avatar = url)}
			/>
		{/each}
	</div>

	<select bind:value={configuration.type} placeholder={$_('CreatePage.selectLabel')}>
		{#each choices as choice}
			<option value={choice.id}>
				{choice.text}
			</option>
		{/each}
	</select>

	<div class="auto-reveal-container">
		<Switch
			bind:value={configuration.autoReveal}
			label={$_('CreatePage.autoRevealResults')}
			fontSize={16}
		/>
	</div>
	<div class="auto-reveal-container">
		<Switch
			bind:value={configuration.voteOnResults}
			label={$_('CreatePage.voteOnResults')}
			fontSize={16}
		/>
	</div>

	<footer>
		<button>Supprimé la room</button>

		<div class="buttons">
			<button> Save </button>
			<button on:click={() => (editRoom = false)}> Cancel </button>
		</div>
	</footer>
</main>

<style lang="scss">
	main {
		display: flex;
		gap: 1.5rem;
		flex-direction: column;
		justify-content: space-between;

		.avatar-container {
			justify-content: left;
		}

		h2 {
			font-size: 2.5rem;
			font-weight: 900;
			line-height: 37px;
			color: var(--primary-950);
			margin-bottom: 2.3rem;
		}

		select {
			max-width: 300px;
		}

		footer {
			display: flex;
			justify-content: space-between;
			flex-direction: row;

			.buttons {
				display: flex;
				justify-content: space-between;
				flex-direction: row;
				gap: 1rem;
			}

			> button {
				background-color: red;
				color: white;
				border: none;
				padding: 0.5rem 1rem;
				border-radius: 0.5rem;
				cursor: pointer;
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		main {
			h2 {
				color: var(--primary-50);
			}

			select {
				background-color: var(--primary-950);
				color: var(--primary-50);
			}

			footer {
				// > button {
				// 	background-color: var(--primary-50);
				// }
			}
		}
	}
</style>
