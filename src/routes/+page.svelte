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
	import Vote from '$lib/components/features/Vote.svelte';
	import Result from '$lib/components/features/Result.svelte';
	import Security from '$lib/components/features/Security.svelte';
	import Estimation from '$lib/components/features/Estimation.svelte';
</script>

<svelte:head>
	<title>Another Planning Poker - Simplify Your Scrum Estimations</title>
	<meta
		name="description"
		content="With Another Planning Poker, streamline your Scrum estimations with instant, clear, and easily understandable results. Enjoy detailed insights, superior analysis, and an efficient Agile planning tool for your team."
	/>
	<meta
		name="og:description"
		content="With Another Planning Poker, streamline your Scrum estimations with instant, clear, and easily understandable results. Enjoy detailed insights, superior analysis, and an efficient Agile planning tool for your team."
	/>
	<meta
		name="twitter:description"
		content="With Another Planning Poker, streamline your Scrum estimations with instant, clear, and easily understandable results. Enjoy detailed insights, superior analysis, and an efficient Agile planning tool for your team."
	/>
</svelte:head>

<main>
	<section class="head">
		<Blob2 />
		<main>
			<div>
				<h1>{$_('HomePage.headings.planPokerSessions')}</h1>
				<h2>{$_('HomePage.headings.togetherEffortlessly')}</h2>
			</div>

			<p>
				<mark>Another Poker Planning</mark>
				{$_('HomePage.description')}
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
	</section>

	<Banner />

	<Feature
		title={$_('HomePage.features.estimationMethods.title')}
		description={$_('HomePage.features.estimationMethods.description')}
	>
		<Estimation />
	</Feature>

	<Feature
		title={$_('HomePage.features.simplifiedVoting.title')}
		description={$_('HomePage.features.simplifiedVoting.description')}
		invert={true}
	>
		<Vote />
	</Feature>

	<Feature
		title={$_('HomePage.features.result.title')}
		description={$_('HomePage.features.result.description')}
	>
		<Result />
	</Feature>

	<Feature
		title={$_('HomePage.features.securityAndEphemerality.title')}
		description={$_('HomePage.features.securityAndEphemerality.description')}
		invert={true}
	>
		<Security />
	</Feature>

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
				width: 55vw;
				line-height: 1.7em;

				mark {
					background-color: var(--primary-500);
					padding: 0.2em;
					border-radius: 0.5em;
					z-index: 1;
					font-weight: bold;
				}
			}
		}

		h1,
		h2 {
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
		section.head {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			main {
				// justify-content: space-evenly !important;
				height: 50vh;

				h1,
				h2 {
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
	}

	@media (prefers-color-scheme: dark) {
		section.head {
			background-color: var(--primary-950);
			h1,
			h2 {
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
	}
</style>
