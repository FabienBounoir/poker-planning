<script>
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	const picto = ['♥', '🂡', '♦', '🂢', '♣', '🂣', '♠', '🂤'];

	const pokerPlanningKeywords = [
		'HomePage.banner.keywords.intuitif',
		'HomePage.banner.keywords.interactif',
		'HomePage.banner.keywords.collaboratif',
		'HomePage.banner.keywords.performant',
		'HomePage.banner.keywords.élégant',
		'HomePage.banner.keywords.pratique',
		'HomePage.banner.keywords.fiable',
		'HomePage.banner.keywords.rapide',
		'HomePage.banner.keywords.efficace',
		'HomePage.banner.keywords.flexible',
		'HomePage.banner.keywords.moderne',
		'HomePage.banner.keywords.adaptable',
		'HomePage.banner.keywords.transparent',
		'HomePage.banner.keywords.convivial',
		'HomePage.banner.keywords.structuré',
		'HomePage.banner.keywords.optimisé'
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
				<span>{$_(keyword)}</span>
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
				color: var(--primary-300);
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

	@media (prefers-color-scheme: dark) {
		section.banner {
			background: linear-gradient(
				180deg,
				var(--primary-950) 0%,
				var(--primary-950) 49%,
				var(--primary-900) 51%,
				var(--primary-900) 100%
			);
			div.container {
				background-color: var(--primary-500);
				color: var(--primary-950);

				b {
					color: var(--primary-900);
				}
			}
		}
	}
</style>
