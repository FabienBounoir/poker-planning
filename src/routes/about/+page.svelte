<script>
	import { _ } from 'svelte-i18n';
</script>

<svelte:head>
	<title>{$_('JoinPage.windowsTitle')} - Another Planning Poker</title>
	<meta
		name="description"
		content="Join your team's poker planning session with ease with Another Planning Poker."
	/>
	<meta
		name="og:description"
		content="Join your team's poker planning session with ease with Another Planning Poker."
	/>
	<meta
		name="twitter:description"
		content="Join your team's poker planning session with ease with Another Planning Poker."
	/>
</svelte:head>

<main>
	<div>
		<h1>{$_('about.title')}</h1>

		<p>{$_('about.intro_1')}</p>
		<p>{$_('about.intro_2')}</p>
		<p>
			👉 {$_('about.intro_3_prefix')} <strong>{$_('about.intro_3_bold_1')}</strong>.
			{$_('about.intro_3_middle')} <strong>{$_('about.intro_3_bold_2')}</strong>.
		</p>

		<h2>{$_('about.features_title')}</h2>

		<ul>
			<li><strong>{$_('about.feature_1_bold')}</strong> {$_('about.feature_1')}</li>
			<li><strong>{$_('about.feature_2_bold')}</strong> {$_('about.feature_2')}</li>
			<li><strong>{$_('about.feature_3_bold')}</strong> {$_('about.feature_3')}</li>
			<li>
				<strong>{$_('about.feature_4_bold')}</strong>
				{$_('about.feature_4_prefix')}
				<strong>{$_('about.feature_4_bold_2')}</strong>, {$_('about.feature_4_middle')}
				<strong>{$_('about.feature_4_bold_3')}</strong>.
			</li>
			<li><strong>{$_('about.feature_5_bold')}</strong> {$_('about.feature_5')}</li>
			<li><strong>{$_('about.feature_6_bold')}</strong> {$_('about.feature_6')}</li>
			<li><strong>{$_('about.feature_7_bold')}</strong> {$_('about.feature_7')}</li>
		</ul>

		<h2>{$_('about.planning_poker_title')}</h2>
		<p>{$_('about.planning_poker_desc')}</p>

		<h2>{$_('about.why_title')}</h2>
		<p>
			{$_('about.why_desc_prefix')} <strong>{$_('about.why_desc_bold')}</strong>.
		</p>

		<h2>{$_('about.conclusion_title')}</h2>
		<p>{$_('about.conclusion_desc')}</p>
	</div>
</main>

<style lang="scss">
	main {
		display: flex;
		justify-content: center;
		min-height: 100dvh;

		& > div {
			display: flex;
			flex-direction: column;
			gap: 1em;
			width: min(90%, 800px);
			margin: 10dvh 0;

			h1 {
				color: var(--primary-500);
				font-weight: 900;
				font-size: 2em;
				margin-bottom: 5dvh;
			}

			h2 {
				color: var(--primary-950);
				font-weight: 700;
				font-size: 1.3em;
				margin-top: 2em;
			}

			strong {
				color: var(--primary-500);
				font-weight: 700;
			}

			li {
				list-style-type: disc;
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		main {
			& > div {
				h1 {
					color: var(--primary-300);
				}

				h2 {
					color: var(--primary-600);
				}

				p,
				ul {
					color: var(--primary-200);
				}

				strong {
					color: var(--primary-500);
				}
			}
		}

		input {
			background-color: var(--primary-800);
			color: var(--primary-200);
			border: 1px solid var(--primary-500);
		}

		button {
			span {
				color: var(--primary-950);
			}
		}

		a {
			color: var(--primary-200);
		}
	}
</style>
