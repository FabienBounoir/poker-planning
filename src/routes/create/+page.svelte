<script>
	import { goto } from '$app/navigation';

	let type = $state();

	let submitting = false;

	const create = async () => {
		submitting = true;
		try {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const ws = new WebSocket(
				`${protocol}//${window.location.host}/create-room?${new URLSearchParams({
					type: type.id
				})}`
			);

			ws.onmessage = (e) => {
				console.log(e);
				const payload = JSON.parse(e.data);
				console.log('payload', payload);
				switch (payload.type) {
					case 'created':
						{
							ws.close();
							goto(`/manager/${payload?.data.roomId}`);
						}
						break;
				}
			};
		} catch (e) {
			console.log('error', e);
		}

		submitting = false;
	};

	let choices = [
		{ id: 'TSHIRT', text: `T-shirts (XS, S, M, L, XL)` },
		{ id: 'FIBONACCI', text: `Fibonacci ( 0, 1, 2, 3, 5, 8, 13, 21 )` },
		{ id: 'POWEROF2', text: `Powers of 2 ( 0, 1, 2, 4, 8, 16, 32 )` }
	];
</script>

<main>
	<h1><br />Create un nouveau poker planning<br />🕵️</h1>
	<form on:submit|preventDefault={create}>
		<select bind:value={type}>
			{#each choices as choice}
				<option value={choice}>
					{choice.text}
				</option>
			{/each}
		</select>
		<button type="submit" disabled={submitting}>Crée</button>
	</form>
</main>

<style lang="scss">
	form {
		display: grid;
		gap: 0.5em;

		span {
			text-align: center;
			font-size: 0.8em;

			&:hover {
				cursor: pointer;
				text-decoration: underline;
			}
		}

		input {
			text-align: center;
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
	}
</style>
