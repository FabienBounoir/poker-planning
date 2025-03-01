<script>
	import Switch from './Switch.svelte';
	import { onMount } from 'svelte';
	import { backOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	let {
		editRoom = $bindable(),
		pokerManager,
		deleteRoom = () => {},
		updateRoom = () => {}
	} = $props();

	let configuration = $state({
		avatar: 'https://api.dicebear.com/9.x/dylan/svg',
		team: '',
		autoReveal: false,
		voteOnResults: false,
		type: 'room',
		cards: undefined
	});

	let loadingType = $state(null);

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
		configuration.team = pokerManager.team;

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
	<h2 in:fly|local={{ easing: backOut, x: -25 }}>{$_('edit.title')}</h2>

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

	<input
		type="text"
		bind:value={configuration.team}
		placeholder={$_('CreatePage.teamInputPlaceholder')}
	/>

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
		<button
			class="danger"
			class:button--loading={loadingType == 'delete'}
			disabled={loadingType == 'delete'}
			on:click={() => {
				loadingType = 'delete';
				deleteRoom();
			}}>{$_('edit.deleteRoom')}</button
		>

		<div class="buttons">
			<button
				class:button--loading={loadingType == 'save'}
				disabled={loadingType == 'save'}
				on:click={() => {
					loadingType = 'save';
					updateRoom(configuration);
				}}
			>
				<span class="button__text">{$_('edit.save')}</span></button
			>
			<button on:click={() => (editRoom = false)}>
				{$_('edit.cancel')}
			</button>
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
			max-width: 38dvw;
		}

		footer {
			display: flex;
			justify-content: space-between;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 1rem;

			.buttons {
				display: flex;
				justify-content: space-between;
				flex-direction: row;
				gap: 0.5rem;

				button {
					position: relative;
				}

				& button:first-child {
					background-color: var(--primary-400);
				}
			}

			.danger {
				position: relative;
				background-color: #c12c2c;
				color: white;
				border: none;
				padding: 0.5rem 1rem;
				border-radius: 0.5rem;
				cursor: pointer;
				transition: 0.3s ease opacity;

				&:hover {
					opacity: 0.8;
				}
			}
		}
	}

	@media screen and (max-width: 950px) {
		main {
			.avatar-container {
				display: flex;
				justify-content: center;
				gap: 1rem;
			}

			select {
				max-width: 95dvw;
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

			input {
				background-color: var(--primary-950);
				color: var(--primary-50);
			}
		}
	}
</style>
