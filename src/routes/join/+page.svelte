<script>
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let roomId = '';

	let submitting = false;

	const join = async () => {
		submitting = true;
		try {
			const res = await fetch(`_api/room?roomId=${roomId}`, {
				method: 'GET'
			});

			if (res.status != 200) {
				throw new Error("This Room doesn't exist");
			}

			await goto(`/rooms/${roomId}`);
		} catch (error) {
			toast.warning("This Room doesn't exist");
		} finally {
			submitting = false;
		}
	};

	function handleInput(event) {
		let value = event.target.value.replace(/[^A-Za-z0-9]/g, ''); // Supprime tout sauf les lettres et les chiffres
		if (value.length > 3) {
			value = value.slice(0, 3) + '-' + value.slice(3, 6);
		}
		roomId = value;
	}
</script>

<main>
	<h1>Hummm, <br />Tu souhaites rejoindre quel poker planning ?<br />🕵️</h1>
	<form on:submit|preventDefault={join}>
		<input
			type="text"
			bind:value={roomId}
			on:input={handleInput}
			placeholder="XXX-XXX"
			disabled={submitting}
		/>
		<button type="submit" disabled={submitting}>Rejoindre</button>
		<span
			on:click={() => {
				goto('/create');
			}}>Pas de code ?</span
		>
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
