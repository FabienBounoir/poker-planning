<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	let type = $state();
	let team = $state('');
	let submitting = $state(false);

	const create = async () => {
		submitting = true;
		try {
			const myHeaders = new Headers();
			myHeaders.append('Content-Type', 'application/json');

			const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room`, {
				method: 'POST',
				headers: myHeaders,
				body: JSON.stringify({
					type,
					team
				})
			})
				.then((response) => response.json())
				.catch((error) => console.error(error));

			if (res && res.roomId) {
				goto(`/manager/${res.roomId}`);
			}
		} catch (error) {
			console.log('Create Error', error);
		}

		submitting = false;
	};

	let choices = [
		{ id: 'TSHIRT', text: `T-shirts (XS, S, M, L, XL)` },
		{ id: 'FIBONACCI', text: `Fibonacci ( 0, 1, 2, 3, 5, 8, 13, 21 )` },
		{ id: 'POWEROF2', text: `Puissance de 2 ( 0, 1, 2, 4, 8, 16, 32 )` },
		{ id: 'SEQUENTIAL', text: `SequentSéquentiel (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)` },
		{ id: 'TSHIRT_HALF', text: `T-shirts Half (XS, S, M, M/L, L, XL)` }
	];

	onMount(() => {
		type = window.localStorage.getItem('type') || 'TSHIRT';
		team = window.localStorage.getItem('team') || '';
	});

	$effect(() => {
		window.localStorage.setItem('type', type);
	});

	$effect(() => {
		window.localStorage.setItem('team', team);
	});
</script>

<svelte:head>
	<title>{$_('CreatePage.title')} - Another Poker Planning</title>
	<meta name="description" content="Crée un poker planning" />
</svelte:head>

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
		<button aria-label={$_('CreatePage.title')} type="submit" disabled={submitting || !team}
			>{$_('CreatePage.createButton')}</button
		>
	</form>
</main>

<style lang="scss">
	form {
		display: grid;
		gap: 0.5em;

		span {
			font-size: 0.8em;

			&:hover {
				cursor: pointer;
				text-decoration: underline;
			}
		}
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
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
</style>
