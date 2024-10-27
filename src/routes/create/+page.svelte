<script>
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';

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
					type: type.id
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
		{ id: 'POWEROF2', text: `Powers of 2 ( 0, 1, 2, 4, 8, 16, 32 )` }
	];

	onDestroy(() => {
		try {
			if (ws) {
				ws.close();
			}
		} catch (error) {
			console.log('Destroy Error', error);
		}
	});
</script>

<main>
	<h1><br />Create un nouveau poker planning<br />🃏</h1>
	<form on:submit|preventDefault={create}>
		<input bind:value={team} placeholder="Nom De La Team" />
		<select bind:value={type}>
			{#each choices as choice}
				<option value={choice}>
					{choice.text}
				</option>
			{/each}
		</select>
		<button type="submit" disabled={submitting || !team}>Crée</button>
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
	}

	h1 {
		font-weight: 900;
		font-size: 2em;
		padding-bottom: 1em;
		color: var(--primary-800);
	}
</style>
