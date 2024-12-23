<script>
	import { onMount } from 'svelte';

	const picto = ['♥', '🂡', '♦', '🂢', '♣', '🂣', '♠', '🂤'];

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

	let scrollValue = 0;
	let totalWidth = 0;

	function handleScroll() {
		scrollValue = window.scrollY;

		if (scrollValue > totalWidth) {
			scrollValue = totalWidth;
		}
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll);

		// Nettoyage au démontage du composant
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<section class="banner">
	<div class="container">
		<div
			bind:clientWidth={totalWidth}
			style="transform: translateX(calc(-1 * {Math.min(scrollValue, totalWidth)}px));"
		>
			{#each pokerPlanningKeywords as keyword, i}
				<span>{keyword}</span>
				<b>
					{picto[i % picto.length]}
				</b>
			{/each}
		</div>
	</div>
</section>

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
</style>
