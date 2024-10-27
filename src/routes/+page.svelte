<script>
	import { goto } from '$app/navigation';
</script>

<main>
	<h1>Another Poker Planning</h1>
	<div class="button-container">
		<button
			on:click={() => {
				goto('/create');
			}}
		>
			Créer
		</button>

		<button
			on:click={() => {
				goto('/join');
			}}>Rejoindre</button
		>
	</div>
</main>

<style lang="scss">
	main {
		background-color: var(--primary-50);
		width: 100%;
		height: 100dvh;

		display: flex;
		flex-direction: column;

		justify-content: center;
		align-items: center;
		gap: 1em;

		h1 {
			font-size: 5vw;
			font-weight: 900;
			color: var(--primary-950);
			margin-bottom: 30dvh;
		}

		.button-container {
			display: flex;
			flex-direction: row;
			gap: 1em;
			width: 40%;
			button {
				width: 100%;
			}
		}
	}
</style>
