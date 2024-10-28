<script>
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	let type = $state();
	let team = $state('');

	let submitting = false;

	let ws;

	const create = async () => {
		submitting = true;
		try {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			ws = new WebSocket(
				`${protocol}//${window.location.host}/create-room?${new URLSearchParams({
					type,
					team
				})}`
			);

			ws.onmessage = (e) => {
				const payload = JSON.parse(e.data);
				console.log('Event Payload', payload);
				switch (payload.type) {
					case 'created':
						goto(`/manager/${payload?.data.roomId}`);
						break;
				}
			};
		} catch (error) {
			console.log('Create Error', error);
		}

		submitting = false;
	};

	let choices = [
		{ id: 'TSHIRT', text: `T-shirts (XS, S, M, L, XL)` },
		{ id: 'FIBONACCI', text: `Fibonacci ( 0, 1, 2, 3, 5, 8, 13, 21 )` },
		{ id: 'POWEROF2', text: `Powers of 2 ( 0, 1, 2, 4, 8, 16, 32 )` },
		{ id: 'SEQUENTIAL', text: `Sequential (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)` },
		{ id: 'TSHIRT_HALF', text: `T-shirts (XS, S, M, M/L, L, XL)` }
	];

	onMount(() => {
		type = window.localStorage.getItem('type') || 'TSHIRT';
		team = window.localStorage.getItem('team') || '';
	});

	onDestroy(() => {
		try {
			if (ws) {
				ws.close();
			}
		} catch (error) {
			console.log('Destroy Error', error);
		}
	});

	$effect(() => {
		window.localStorage.setItem('type', type);
	});

	$effect(() => {
		window.localStorage.setItem('team', team);
	});
</script>

<main in:scale={{ duration: 300, easing: quintOut }}>
	<h1>Créer un nouveau poker planning <span class="animateJoker">🃏</span></h1>
	<form on:submit|preventDefault={create}>
		<input bind:value={team} placeholder="Nom De La Team" />
		<select bind:value={type}>
			{#each choices as choice}
				<option value={choice.id}>
					{choice.text}
				</option>
			{/each}
		</select>
		<button type="submit" disabled={submitting || !team}>Créer</button>
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
					transform: scale(1) rotate(0deg); /* Taille normale, pas de rotation */
				}
				25% {
					transform: scale(1.2) rotate(15deg); /* Zoom avant et rotation vers la droite */
				}
				50% {
					transform: scale(1) rotate(-15deg); /* Retour à la taille normale, rotation vers la gauche */
				}
				75% {
					transform: scale(1.2) rotate(10deg); /* Zoom avant et légère rotation vers la droite */
				}
				100% {
					transform: scale(1) rotate(0deg); /* Retour à la taille normale et à la position initiale */
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
