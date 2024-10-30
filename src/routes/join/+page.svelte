<script>
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let roomId = $state('');
	let submitting = $state(false);

	const join = async () => {
		submitting = true;

		const myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/json');

		const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room?roomId=${roomId}`, {
			method: 'GET',
			headers: myHeaders
		})
			.then((response) => response.json())
			.catch((error) => console.error(error));

		if (res && res.roomId) {
			return goto(`/rooms/${res.roomId}`);
		}

		toast.error("La room n'existe pas...");

		submitting = false;
	};

	function handleInput(event) {
		let value = event.target.value.replace(/[^A-Za-z0-9]/g, '');
		if (value.length > 3) {
			value = value.slice(0, 3) + '-' + value.slice(3, 6);
		}
		roomId = value;
	}
</script>

<main>
	<h1>
		Hummm <span class="animateDetective">🕵️</span>,<br />Quel poker planning souhaites-tu rejoindre
		?
	</h1>
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
		scale: 0;
		animation: scale 0.5s forwards 0.2s;

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
		color: var(--primary-950);

		.animateDetective {
			display: inline-block;
			animation: bounceRotate 2s infinite;

			@keyframes bounceRotate {
				0% {
					transform: translateY(0) rotate(0deg); /* Position initiale */
				}
				25% {
					transform: translateY(-10px) rotate(5deg); /* Légère élévation et rotation vers la droite */
				}
				50% {
					transform: translateY(0) rotate(-5deg); /* Retour à la position normale avec rotation vers la gauche */
				}
				75% {
					transform: translateY(2px) rotate(4deg); /* Élément un peu plus bas avec rotation vers la droite */
				}
				100% {
					transform: translateY(0) rotate(0deg); /* Retour à la position initiale */
				}
			}
		}
	}
</style>
