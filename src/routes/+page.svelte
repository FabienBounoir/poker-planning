<script>
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import Blob1 from '$lib/components/blob/Blob1.svelte';
	import Blob2 from '$lib/components/blob/blob2.svelte';
	import Feature from '$lib/components/Feature.svelte';
	import Plan from '$lib/components/Plan.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import Vote from '$lib/components/features/Vote.svelte';
	import Result from '$lib/components/features/Result.svelte';
	import Security from '$lib/components/features/Security.svelte';
	import Estimation from '$lib/components/features/Estimation.svelte';
	import Footer from '$lib/components/Footer.svelte';
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
				<a aria-label="Go to Create Page" href="/create" title={$_('CreatePage.title')}>
					{$_('HomePage.buttons.create')}
				</a>

				<a aria-label="Go to Join page" href="/join" title={$_('JoinPage.title')}
					>{$_('HomePage.buttons.join')}</a
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

	<Footer />
</main>

<style lang="scss">
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
			a {
				cursor: pointer;

				border: none;

				background-color: var(--primary-500);
				color: var(--primary-950);
				font-weight: 600;

				padding: 0.5rem 0.75rem;
				border-radius: 0.5rem;

				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0.5rem;

				outline-color: var(--primary-200);
				text-align: center;

				transition-property: outline-width, opacity;

				text-decoration: none;
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
					a {
						width: 100%;
					}
				}
			}
		}
	}

	@media screen and (max-height: 550px) and (max-width: 950px) {
		section.head {
			main {
				h1,
				h2 {
					font-size: 2em !important;
				}

				p {
					display: none;
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
	}
</style>
