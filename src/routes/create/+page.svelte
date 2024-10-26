<script>
	import { goto } from '$app/navigation';

	let code = '';

	let submitting = false;

	const join = async () => {
		submitting = true;
		try {
			await goto('/manager/1');
		} catch (error) {
		} finally {
			submitting = false;
		}
	};
</script>

<main>
	<h1><br />Create un nouveau poker planning<br />🕵️</h1>
	<form on:submit|preventDefault={join}>
		<input type="text" bind:value={code} placeholder="XXXXXX" disabled={submitting} />
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
