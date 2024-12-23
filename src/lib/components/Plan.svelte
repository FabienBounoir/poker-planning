<script>
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
</script>

<section class="plan">
	<h1>Pas de Frais, Pas de Limites</h1>

	<div class="card">
		<div>
			<h2>All Inclusive</h2>

			<p>
				Another Poker Planning est un outil gratuit et sans publicité. Pas de compte à créer, pas de
				limite de participants, pas de frais cachés. Tout est pensé pour vous offrir une expérience
				optimale.
			</p>
		</div>

		<div>
			<h3>Ready to play?</h3>

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
			<h3>Free without limits</h3>

			<ul>
				<li>Unlimited participants</li>
				<li>Unlimited Votes per session</li>
				<li>No account required</li>
				<li>No hidden fees</li>
			</ul>
		</div>
	</div>
</section>

<style lang="scss">
	section.plan {
		background-color: var(--primary-200);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2em;
		padding: 0 0 3em 0;

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
			// max-height: 60vh;
			// aspect-ratio: 2/2.7;
			width: min-content;
			border-radius: 1em;
			background-color: var(--primary-50);
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
				// margin: 0.3em 0 1em 0;
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
				width: 90vw;
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
				width: 90vw;
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
</style>
