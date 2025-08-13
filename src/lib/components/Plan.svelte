<script>
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
</script>

<section class="plan">
	<h1>{$_('HomePage.plan.heading')}</h1>

	<div class="card">
		<div>
			<h2>{$_('HomePage.plan.card.allInclusive.title')}</h2>

			<p>{$_('HomePage.plan.card.allInclusive.description')}</p>
		</div>

		<div>
			<h3>{$_('HomePage.plan.card.readyToPlay.title')}</h3>

			<button
				aria-label="Go to Create Page"
				on:click={() => {
					goto('/create');
				}}
			>
				{$_('HomePage.buttons.create')}
			</button>
		</div>

		<div>
			<h3>{$_('HomePage.plan.card.features.freeWithoutLimits')}</h3>

			<ul>
				<li>{$_('HomePage.plan.card.features.list.unlimitedParticipants')}</li>
				<li>{$_('HomePage.plan.card.features.list.unlimitedVotes')}</li>
				<li>{$_('HomePage.plan.card.features.list.noAccountRequired')}</li>
				<li>{$_('HomePage.plan.card.features.list.noHiddenFees')}</li>
			</ul>
		</div>
	</div>
</section>

<style lang="scss">
	section.plan {
		background-color: var(--primary-50);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2em;
		padding: 4em 0 4em 0;

		h1 {
			font-size: 3rem;
			font-weight: 700;
			line-height: 4rem;
			margin: 0;
			max-width: -webkit-max-content;
			max-width: max-content;
			text-align: left;
		}

		.card {
			width: min-content;
			border-radius: 1em;
			background-color: var(--primary-200);
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
			padding: 1em;

			display: flex;
			flex-direction: column;
			gap: 2em;

			p {
				text-wrap: balance;
			}

			> div {
				display: flex;
				flex-direction: column;
				gap: 0.3em;
			}

			h2 {
				font-size: 1.5em;
				color: var(--primary-950);
				font-weight: 700;
				text-align: left;
			}

			button {
				width: 25vw;
				font-weight: bold;
				transition: scale 0.3s !important;

				&:hover {
					scale: 1.05;
				}
			}

			ul {
				list-style-type: none;
				padding: 0;
				li {
					display: flex;
					align-items: center;
					gap: 1em;
					font-size: 1.2em;
					color: var(--primary-800);

					&::before {
						content: '•';
						color: var(--primary-500);
						font-weight: bold;
						display: inline-block;
						width: 1em;
						margin-left: 0.3em;
					}
				}
			}
		}
	}

	@media screen and (max-width: 800px) {
		section.plan {
			h1 {
				font-size: 2rem;
			}

			.card {
				padding: 1em;
				gap: 1em;

				h2 {
					font-size: 1.2em;
				}

				button {
					width: 80vw;
				}

				ul {
					li {
						font-size: 1em;
					}
				}
			}
		}
	}

	@media screen and (max-width: 500px) {
		section.plan {
			h1 {
				font-size: 1.5rem;
			}

			.card {
				padding: 1em;
				gap: 1em;

				h2 {
					font-size: 1.2em;
				}

				button {
					width: 80vw;
				}

				ul {
					li {
						font-size: 1em;
					}
				}
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		section.plan {
			background-color: var(--primary-900);
			h1 {
				color: var(--primary-50);
			}
		}
	}
</style>
