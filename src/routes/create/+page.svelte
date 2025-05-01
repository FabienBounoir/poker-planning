<script lang="ts">
	import { goto } from '$app/navigation';
	import { accordion } from '$lib/animations/accordion';
	import Switch from '$lib/components/Switch.svelte';
	import type { CardsChoice } from '$lib/components/types/CardsChoices';
	import myshades from '$lib/myshades';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { toast } from 'svelte-sonner';
	import { quintOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';

	let type = $state('TSHIRT');
	let team = $state('');

	let status = $state('init');

	let advancedSettingsObject = $state({
		hexcode: '#FF7F00',
		avatar: 'https://api.dicebear.com/9.x/dylan/svg',
		autoReveal: false,
		voteOnResults: false
	});

	let submitting = $state(false);
	let advancedSettings = $state(false);
	let customCard = $state({
		name: 'My Custom Deck',
		cards: []
	});

	const avatarUrl = [
		'https://api.dicebear.com/9.x/adventurer/svg',
		'https://api.dicebear.com/9.x/avataaars/svg',
		'https://api.dicebear.com/9.x/dylan/svg',
		'https://api.dicebear.com/9.x/miniavs/svg',
		'https://api.dicebear.com/9.x/personas/svg'
	];

	const seed = 'bouns';

	const create = async () => {
		submitting = true;
		checkDuplicate();
		try {
			const myHeaders = new Headers();
			myHeaders.append('Content-Type', 'application/json');

			let bodyBuilder = {
				type,
				team,
				cards: undefined
			};

			if (advancedSettings) {
				bodyBuilder = { ...bodyBuilder, ...advancedSettingsObject };
			}

			if (type.startsWith('CUSTOM-')) {
				const customChoice = choices?.find?.((choice) => choice.id === type);
				bodyBuilder = { ...bodyBuilder, cards: customChoice?.cards };
			}

			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room`, {
				method: 'POST',
				headers: myHeaders,
				body: JSON.stringify(bodyBuilder)
			});

			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response?.statusText}`);
			}

			const data = await response.json();

			if (!data || !data.roomId) {
				throw new Error('Invalid response data');
			}

			goto(`/manager/${data.roomId}`);
		} catch (error) {
			console.log('Create Error', error);
			toast.error($_('CreatePage.error'));
		}

		submitting = false;
	};

	let choices: CardsChoice[] = $state([
		{ id: 'TSHIRT', text: $_('selectCategories.types.TSHIRT') },
		{ id: 'FIBONACCI', text: $_('selectCategories.types.FIBONACCI') },
		{ id: 'POWEROF2', text: $_('selectCategories.types.POWEROF2') },
		{ id: 'SEQUENTIAL', text: $_('selectCategories.types.SEQUENTIAL') },
		{ id: 'TSHIRT_HALF', text: $_('selectCategories.types.TSHIRT_HALF') }
	]);

	onMount(() => {
		if (window?.localStorage?.getItem?.('advancedSettings')) {
			advancedSettingsObject = {
				...advancedSettingsObject,
				...JSON.parse(window.localStorage.getItem('advancedSettings'))
			};
			advancedSettings = true;
		}

		const getCustomDeck = Object.keys(window?.localStorage || {}).filter((key) =>
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

		choices.push({ id: 'CUSTOM', text: $_('selectCategories.types.CUSTOM') });

		type = window.localStorage?.getItem?.('type') || 'TSHIRT';
		team = window.localStorage?.getItem?.('team') || '';

		status = 'create';
	});

	const addNewDeck = () => {
		window.localStorage.setItem(
			`custom-${customCard.name}`.toLocaleUpperCase(),
			JSON.stringify(customCard)
		);

		//check if deck already exist
		choices = choices.filter(
			(choice) => choice.id !== `custom-${customCard.name}`.toLocaleUpperCase()
		);

		//add new deck before custom
		choices.splice(choices.length - 1, 0, {
			id: `custom-${customCard.name}`.toLocaleUpperCase(),
			text: `${customCard.name} (${customCard.cards.join(', ')})`,
			cards: customCard.cards
		});

		type = `custom-${customCard.name}`.toLocaleUpperCase();

		goToCreate(false);
	};

	const goToCreate = (resetChoice = true) => {
		customCard = {
			name: 'My Custom Deck',
			cards: []
		};

		if (resetChoice) {
			type = 'TSHIRT';
		}

		status = 'create';
	};

	const checkDuplicate = () => {
		const primaryColors = [
			'--primary-50',
			'--primary-100',
			'--primary-200',
			'--primary-300',
			'--primary-400',
			'--primary-500',
			'--primary-600',
			'--primary-700',
			'--primary-800',
			'--primary-900',
			'--primary-950'
		];

		const colorValues = primaryColors.map((color) =>
			getComputedStyle(document.documentElement).getPropertyValue(color).trim()
		);

		const duplicates = colorValues.filter((color, index) => colorValues.indexOf(color) !== index);

		if (duplicates.length > 0) {
			advancedSettingsObject.hexcode = '#ff8000';
			myshades({
				primary: '#ff8000'
			});
		}
	};

	$effect(() => {
		if (type === 'CUSTOM') {
			status = 'new-card';
		} else {
			window.localStorage.setItem('type', type);
			status = 'create';
		}
	});

	$effect(() => {
		window.localStorage.setItem('team', team);
	});

	$effect(() => {
		myshades({
			primary: advancedSettingsObject.hexcode
		});
	});

	$effect(() => {
		if (status != 'create') return;

		if (advancedSettings) {
			window.localStorage.setItem('advancedSettings', JSON.stringify(advancedSettingsObject));
		} else {
			window.localStorage.removeItem('advancedSettings');
		}
	});
</script>

<svelte:head>
	<title>{$_('CreatePage.title')} - Another Planning Poker</title>
	<meta
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
	/>
</svelte:head>

{#if status == 'create'}
	<main in:scale={{ duration: 300, easing: quintOut }}>
		<h1>{$_('CreatePage.title')} <span class="animateJoker">🃏</span></h1>
		<form on:submit|preventDefault={create}>
			<input bind:value={team} placeholder={$_('CreatePage.teamInputPlaceholder')} />
			<select bind:value={type} placeholder={$_('CreatePage.selectLabel')}>
				{#each choices as choice}
					<option value={choice.id}>
						{choice.text}
					</option>
				{/each}
			</select>

			<button
				type="button"
				class={'advance-setting-button'}
				class:activate={advancedSettings}
				on:click={() => (advancedSettings = !advancedSettings)}
			>
				<p>
					{$_('CreatePage.advancedSettings')}
					<svg width="15" viewBox="0 0 56 34" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M3 31L28 6L53 31" stroke-width="6" />
					</svg>
				</p>
			</button>

			<div use:accordion={advancedSettings} class="advance-settings">
				<div class="avatar-container">
					{#each avatarUrl as url}
						<img
							src={url + `?seed=${seed}`}
							alt="avatar"
							class:selected={advancedSettingsObject.avatar === url}
							on:click={() => (advancedSettingsObject.avatar = url)}
						/>
					{/each}
				</div>

				<div class="color-container">
					<p>{$_('CreatePage.pokerPlanningColor')}</p>
					<label style="background-color: {advancedSettingsObject.hexcode}">
						<input type="color" bind:value={advancedSettingsObject.hexcode} />
					</label>
				</div>

				<div class="auto-reveal-container">
					<Switch
						bind:value={advancedSettingsObject.autoReveal}
						label={$_('CreatePage.autoRevealResults')}
						fontSize={16}
					/>
				</div>
				<div class="auto-reveal-container">
					<Switch
						bind:value={advancedSettingsObject.voteOnResults}
						label={$_('CreatePage.voteOnResults')}
						fontSize={16}
					/>
				</div>
			</div>
			<button
				class:button--loading={submitting}
				aria-label={$_('CreatePage.title')}
				type="submit"
				disabled={submitting || !team}
			>
				<span class="button__text">{$_('CreatePage.createButton')}</span>
			</button>
		</form>
	</main>
{:else if status == 'new-card'}
	<main class="create-new-set">
		<h1>{$_('CreatePage.createNewSetOfCards')} <span class="animateJoker">🃏</span></h1>

		<input bind:value={customCard.name} placeholder={$_('CreatePage.deckName')} />
		<input
			value={customCard.cards ? customCard.cards.join(',') : ''}
			placeholder="XS,S,M,L,XL"
			on:input={(e) => {
				const cardsSplit = e.target.value.split(',');
				customCard.cards = cardsSplit.filter((card) => card).map((card) => card.trim().slice(0, 3));
			}}
		/>

		<div>
			<label for="card-preview">{$_('CreatePage.preview')}</label>
			<div class="card-preview" id="card-preview">
				{#each customCard.cards as card}
					<button
						tabindex="0"
						class="card"
						in:fade
						on:click={() => (customCard.cards = customCard.cards.filter((c) => c !== card))}
					>
						<p>{`${card}`.slice(0, 3)}</p>
					</button>
				{/each}

				{#if customCard?.cards?.length == 0}
					<div class="card skeleton">
						<p>♠</p>
					</div>
				{/if}

				{#if customCard?.cards?.length <= 1}
					<div class="card skeleton">
						<p>♣</p>
					</div>
				{/if}
			</div>
		</div>

		<div class="button-container">
			<button on:click={goToCreate}>{$_('CreatePage.cancel')}</button>
			<button on:click={addNewDeck} disabled={!customCard.name || customCard.cards.length < 2}
				>{$_('CreatePage.save')}</button
			>
		</div>
	</main>
{/if}

<style lang="scss">
	.button--loading .button__text {
		visibility: hidden;
		opacity: 0;
	}

	.button--loading::after {
		content: '';
		position: absolute;
		width: 16px;
		height: 16px;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		margin: auto;
		border: 4px solid transparent;
		border-top-color: #ffffff;
		border-radius: 50%;
		animation: button-loading-spinner 1s ease infinite;
	}

	select {
		max-width: 300px;
	}

	.create-new-set {
		display: flex;
		gap: 0.5em;

		input {
			width: 300px;
		}

		label {
			color: var(--primary-950);
		}

		.card-preview {
			display: flex;
			gap: 0.5em;
			justify-content: center;
			align-items: center;
			flex-wrap: wrap;
			max-width: 300px;

			.card {
				all: unset;
				width: 2.5em;
				aspect-ratio: 2.5 / 4;
				background-color: var(--primary-200);
				border: 1px solid var(--primary-800);
				border-radius: 8px;

				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				p {
					color: var(--primary-800);
				}

				&:hover:not(.skeleton) {
					animation: shake 1s alternate infinite;
					cursor: pointer;
					filter: grayscale(50%);
				}

				@keyframes shake {
					0% {
						transform: translate(1px, 1px) rotate(0deg);
					}
					10% {
						transform: translate(-1px, -2px) rotate(-1deg);
					}
					20% {
						transform: translate(-3px, 0px) rotate(1deg);
					}
					30% {
						transform: translate(3px, 2px) rotate(0deg);
					}
					40% {
						transform: translate(1px, -1px) rotate(1deg);
					}
					50% {
						transform: translate(-1px, 2px) rotate(-1deg);
					}
					60% {
						transform: translate(-3px, 1px) rotate(0deg);
					}
					70% {
						transform: translate(3px, 1px) rotate(-1deg);
					}
					80% {
						transform: translate(-1px, -1px) rotate(1deg);
					}
					90% {
						transform: translate(1px, 2px) rotate(0deg);
					}
					100% {
						transform: translate(1px, -2px) rotate(-1deg);
					}
				}

				&.skeleton {
					border-style: dashed;
					filter: grayscale(100%);
				}
			}
		}

		.button-container {
			display: flex;
			justify-content: space-between;
			gap: 0.5em;
			width: 300px;

			button {
				width: 100%;
			}
		}
	}

	form {
		display: grid;
		gap: 0.5em;

		> button {
			transition: all 0.2s;
			position: relative;
			margin-top: 1em;
		}

		.advance-settings {
			& > * {
				margin-top: 1em;
			}

			.color-container {
				display: flex;
				flex-direction: row;
				gap: 0.5em;
				align-items: center;
				justify-content: space-between;

				label {
					display: block;
					cursor: pointer;
					background-color: var(--custom-color);
					border-radius: 0.5rem;
					border: 1px solid var(--primary-300);
					aspect-ratio: 2 / 1;
					position: relative;
					width: 3em;

					input {
						visibility: hidden;
					}
				}
			}

			input {
				width: 100%;
			}
		}

		.advance-setting-button {
			all: unset;
			display: flex;
			gap: 0.5em;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			color: var(--primary-800);

			p {
				display: flex;
				gap: 0.5em;
				align-items: center;
				justify-content: center;
				transition: background-color 0.3s ease-in-out !important;
				padding: 0 0.5em;
				border-radius: 5px;
			}

			&:hover p {
				background-color: var(--primary-200);
			}

			&.activate {
				svg {
					transform: rotate(0deg);
				}
			}

			svg {
				transition: transform 0.3s ease-in-out;
				stroke: var(--primary-800);
				transform: rotate(180deg);
			}
		}
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		text-align: center;
		scale: 0;
		animation: scale 0.5s forwards 0.2s;

		.animateJoker {
			display: inline-block;
			animation: scaleShake 1s infinite;

			@keyframes scaleShake {
				0% {
					transform: scale(1) rotate(0deg);
				}
				25% {
					transform: scale(1.2) rotate(15deg);
				}
				50% {
					transform: scale(1) rotate(-15deg);
				}
				75% {
					transform: scale(1.2) rotate(10deg);
				}
				100% {
					transform: scale(1) rotate(0deg);
				}
			}
		}

		@keyframes scale {
			0% {
				scale: 0;
			}

			100% {
				scale: 1;
			}
		}
	}

	h1 {
		font-weight: 900;
		font-size: 2em;
		padding-bottom: 1em;
		color: var(--primary-800);
	}

	@media (prefers-color-scheme: dark) {
		h1 {
			color: var(--primary-100);
		}

		.create-new-set {
			label {
				color: var(--primary-100);
			}

			.card {
				p {
					color: var(--primary-800);
				}
			}
		}

		.advance-setting-button {
			&:hover {
				p {
					background-color: var(--primary-800) !important;
				}
			}
			svg {
				stroke: var(--primary-100) !important;
			}
		}

		p {
			color: var(--primary-100);
		}

		input {
			background-color: var(--primary-800);
			color: var(--primary-100);
		}

		select {
			background-color: var(--primary-800);
			color: var(--primary-100);
		}
	}
</style>
