<script>
	import { goto } from '$app/navigation';
</script>

<main>
	<h1>Another Poker Planning</h1>
	<div class="button-container">
		<button
			onclick={() => {
				goto('/create');
			}}
		>
			Créer
		</button>

		<button
			onclick={() => {
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
			gap: 2em;
			width: 40%;
			button {
				width: 100%;
				transition: scale 0.3s !important;

				&:hover {
					scale: 1.05;
				}
			}
		}
	}

	@media screen and (max-width: 950px) {
		main {
			h1 {
				font-size: 7vw;
			}
			.button-container {
				display: flex;
				flex-direction: column;
				width: 80%;
				gap: 1em;
				button {
					width: 100%;
				}
			}
		}
	}
</style>
