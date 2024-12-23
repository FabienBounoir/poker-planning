<script>
	import { goto } from '$app/navigation';
	import Blob1 from '$lib/components/blob/Blob1.svelte';
	import Blob2 from '$lib/components/blob/blob2.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Feature from '$lib/components/Feature.svelte';
	import Plan from '$lib/components/Plan.svelte';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import Banner from '$lib/components/Banner.svelte';
</script>

<main>
	<section class="head">
		<main>
			<div>
				<h1>Plan your poker sessions.</h1>
				<h1>Together. Effortlessly.</h1>
			</div>

			<p>
				<mark>Another Poker Planning</mark> is a straightforward tool designed to enhance teamwork, improve
				accuracy, and bring clarity to your estimation sessions, all in one place.
			</p>

			<div class="button-container">
				<button
					aria-label="Go to Create Page"
					on:click={() => {
						goto('/create');
					}}
				>
					{$_('HomePage.buttons.create')}
				</button>

				<button
					aria-label="Go to Join page"
					on:click={() => {
						goto('/join');
					}}>{$_('HomePage.buttons.join')}</button
				>
			</div>
		</main>
		<Blob1 />
		<Blob2 />
	</section>

	<Banner />

	<Feature
		title="Méthodes de Chiffrage"
		description="Avec Another Poker Planning, estimez la complexité d’une tâche grâce à une échelle à plusieurs niveaux. Une approche pensée pour recueillir l’avis de l’équipe et aboutir à un consensus clair et précis."
	/>

	<Feature
		title="Le Vote Simplifié"
		description="Découvrez une expérience fluide et intuitive pour vos sessions de poker planning. Choisissez votre estimation en un seul clic, sans complexité, sans détour. Voter n’a jamais été aussi naturel."
		invert={true}
	/>

	<Feature
		title="Result"
		description="Visualisez instantanément les votes de l’équipe grâce à un affichage clair et élégant. Chaque estimation est mise en valeur pour faciliter la discussion et atteindre rapidement un consensus."
	/>

	<Feature
		title="Sécurité et Éphémérité"
		description="Vos données, votre sérénité. Aucune information n'est sauvegardée, tout se fait en temps
					réel. Une fois le vote terminé, la room s’auto-détruit après quelques heures. Parce que
					vos échanges doivent rester aussi éphémères que vos décisions."
		invert={true}
	/>

	<Plan />

	<!-- <Footer /> -->
</main>

<style lang="scss">
	section.banner {
		overflow: hidden;
		height: 12vh;
		justify-items: center;
		place-content: center;
		background: linear-gradient(
			180deg,
			var(--primary-50) 0%,
			var(--primary-50) 49%,
			var(--primary-200) 51%,
			var(--primary-200) 100%
		);
		div.container {
			height: 9vh;
			width: 110vw;
			background-color: var(--primary-800);
			transform: rotate(-1deg);
			color: var(--primary-100);
			transition: transform 0.1s linear;
			display: flex;
			flex-direction: row;
			align-items: center;
			user-select: none;

			b {
				color: var(--primary-500);
				font-weight: 900;
				font-size: 1.2em;
			}

			> div {
				transform: translateX(0);
				margin-left: 2em;
				display: flex;
				flex-direction: row;
				gap: 3em;
				align-items: center;
				font-weight: 900;

				white-space: nowrap;
				transition: transform 0.1s linear;
			}
		}
	}

	section.head {
		background-color: var(--primary-50);
		width: 100%;
		height: 85dvh;

		display: flex;
		flex-direction: column;

		justify-content: center;
		align-items: center;
		gap: 1em;
		position: relative;

		main {
			display: flex;
			align-items: center;
			flex-direction: column;
			gap: 2em;
			align-items: center;
			justify-content: center;

			p {
				text-wrap: balance;
				text-align: center;
				width: 70%;

				mark {
					background-color: var(--primary-500);
					padding: 0.2em;
					border-radius: 0.5em;
					z-index: 1;
					font-weight: bold;
				}
			}
		}

		h1 {
			font-size: 3.5vw;
			font-weight: 900;
			color: var(--primary-950);
			text-align: center;
			margin-bottom: 0dvh;
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
				font-weight: bold;
			}
		}
	}

	@media screen and (max-width: 950px) {
		main {
			justify-content: space-evenly !important;
			height: 60vh;

			h1 {
				font-size: 7vw !important;
			}

			p {
				width: 90% !important;
			}
			.button-container {
				display: flex;
				flex-direction: column !important;
				width: 80% !important;
				gap: 1em !important;
				button {
					width: 100%;
				}
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		section.head {
			background-color: var(--primary-950);
			h1 {
				color: var(--primary-50);
			}
			p {
				color: var(--primary-50);
			}

			mark {
				color: var(--primary-950);
			}
		}
		section.module {
			background-color: var(--primary-800);
			color: var(--primary-50);
		}
		section.banner {
			background: linear-gradient(
				180deg,
				var(--primary-950) 0%,
				var(--primary-950) 49%,
				var(--primary-600) 51%,
				var(--primary-600) 100%
			);
			div.container {
				background-color: var(--primary-800);
				color: var(--primary-50);
			}
		}
	}
</style>
