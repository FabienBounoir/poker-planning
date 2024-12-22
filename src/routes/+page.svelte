<script>
	import { goto } from '$app/navigation';
	import Blob1 from '$lib/components/blob/Blob1.svelte';
	import Blob2 from '$lib/components/blob/blob2.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	const pokerPlanningKeywords = [
		'Intuitif',
		'Interactif',
		'Collaboratif',
		'Performant',
		'Élégant',
		'Pratique',
		'Fiable',
		'Rapide',
		'Efficace',
		'Accessible',
		'Flexible',
		'Moderne',
		'Adaptable',
		'Transparent',
		'Convivial',
		'Structuré',
		'Optimisé'
	];

	let scrollValue = 0; // Position du scroll
	let totalWidth = 0; // Largeur totale de la div contenant les mots

	// Fonction appelée sur scroll
	function handleScroll() {
		// Récupère la valeur de scroll actuelle
		scrollValue = window.scrollY;

		// Limite le déplacement pour ne pas dépasser la fin
		if (scrollValue > totalWidth) {
			scrollValue = totalWidth;
		}
	}

	// // Calcul dynamique de la largeur totale de la div
	// function calculateWidth(node) {
	// 	totalWidth = node.scrollWidth - window.innerWidth;
	// }

	onMount(() => {
		window.addEventListener('scroll', handleScroll);

		// Nettoyage au démontage du composant
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
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
	<section class="banner">
		<div class="container">
			<div
				bind:clientWidth={totalWidth}
				style="transform: translateX(calc(-1 * {Math.min(scrollValue, totalWidth)}px));"
			>
				{#each pokerPlanningKeywords as keyword}
					<span>{keyword}</span>
					<b>#</b>
				{/each}
			</div>
		</div>
	</section>
	<section class="module">
		<h2>Vote</h2>
		<p>
			With another poker planning, you can vote on the complexity of a task using a multi-point
			scale. This approach allows you to gather the team's opinion and reach a consensus on the
			task's complexity.
		</p>
		<div class="container">
			<div>
				<h1>How it works</h1>
				<p>
					<mark>Another Poker Planning</mark> is a simple tool that allows you to create and join poker
					planning sessions with your team. It is designed to be intuitive, interactive, and collaborative.
				</p>
			</div>
			<div>
				<img src="/banner.png" alt="Team Spirit" />
			</div>
		</div>
	</section>
	<section class="module">
		<div class="container">Vote</div>
	</section>
	<section class="module">
		<div class="container">Results</div>
	</section>

	<section class="module">
		<div class="container">Plan</div>
	</section>

	<Footer />
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
			var(--primary-600) 51%,
			var(--primary-600) 100%
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

	section.module {
		height: 85vh;
		width: 100%;
		background-color: var(--primary-600);
		display: flex;
		justify-content: center;
		flex-direction: column;
		gap: 3rem;
		text-align: left;
		margin: auto;

		p {
			width: 50%;
		}

		h2 {
			font-size: 3.5rem;
			font-weight: 700;
			line-height: 4rem;
			margin: 0;
			max-width: -webkit-max-content;
			max-width: max-content;
			text-align: left;
		}

		div.container {
			width: 80%;
			height: 70%;
			background-color: var(--primary-950);
			border-radius: 1em;
			color: var(--primary-50);

			display: grid;
			grid-template-columns: 1fr 1fr;

			div {
				padding: 2em;
				h1 {
					font-size: 2.5em;
					color: var(--primary-950);
					margin-bottom: 1em;
				}
				img {
					width: 100%;
				}
			}
		}
	}

	section.head {
		// background: radial-gradient(300% 30% at 50% 100%, var(--primary-100) 0, var(--primary-50) 100%),
		// 	#0f0f10;
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
