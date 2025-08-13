<script>
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
</script>

<section class="plan">
	<div class="plan-content">
		<div class="plan-header">
			<h1>{$_('HomePage.plan.heading')}</h1>
			<p class="plan-subtitle">{$_('HomePage.plan.subtitle')}</p>
		</div>

		<div class="pricing-container">
			<!-- Carte "Autres services" avec prix élevé -->
			<div class="card competitor-card">
				<div class="competitor-badge">{$_('HomePage.plan.competitor.badge')}</div>
				<div class="card-header">
					<h3>{$_('HomePage.plan.competitor.title')}</h3>
					<div class="price-tag crossed-out">
						<span class="currency">€</span>
						<span class="amount">30</span>
						<span class="period">/mois</span>
					</div>
				</div>
				<ul class="features-list limited">
					<li class="limited-feature">
						{$_('HomePage.plan.competitor.limitations.limitedParticipants')}
					</li>
					<li class="limited-feature">{$_('HomePage.plan.competitor.limitations.limitedVotes')}</li>
					<li class="limited-feature">
						{$_('HomePage.plan.competitor.limitations.accountRequired')}
					</li>
					<li class="limited-feature">{$_('HomePage.plan.competitor.limitations.hiddenFees')}</li>
				</ul>
			</div>

			<!-- Notre carte avec un design premium -->
			<div class="card our-card featured">
				<div class="card-header">
					<div class="badge">{$_('HomePage.plan.card.recommended')}</div>
					<h2>{$_('HomePage.plan.card.allInclusive.title')}</h2>
					<div class="price-tag free">
						<span class="amount">{$_('HomePage.plan.card.free')}</span>
						<span class="period">{$_('HomePage.plan.card.forever')}</span>
					</div>
					<p class="card-description">{$_('HomePage.plan.card.allInclusive.description')}</p>
				</div>

				<ul class="features-list">
					<li>{$_('HomePage.plan.card.features.list.unlimitedParticipants')}</li>
					<li>{$_('HomePage.plan.card.features.list.unlimitedVotes')}</li>
					<li>{$_('HomePage.plan.card.features.list.noAccountRequired')}</li>
					<li>{$_('HomePage.plan.card.features.list.noHiddenFees')}</li>
				</ul>

				<div class="cta-section">
					<h3>{$_('HomePage.plan.card.readyToPlay.title')}</h3>
					<button
						class="cta-button"
						aria-label="Go to Create Page"
						on:click={() => {
							goto('/create');
						}}
					>
						{$_('HomePage.buttons.create')}
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<style lang="scss">
	section.plan {
		background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
		padding: 6em 2em;
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v20h20V20z'/%3E%3C/g%3E%3C/svg%3E")
				repeat;
			pointer-events: none;
		}

		.plan-content {
			max-width: 1200px;
			margin: 0 auto;
			position: relative;
			z-index: 1;
		}

		.plan-header {
			text-align: center;
			margin-bottom: 4em;

			h1 {
				font-size: 3.5rem;
				font-weight: 800;
				line-height: 1.2;
				margin: 0 0 1rem 0;
				background: linear-gradient(135deg, var(--primary-800) 0%, var(--primary-600) 100%);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				background-clip: text;
			}

			.plan-subtitle {
				font-size: 1.3rem;
				color: var(--primary-700);
				margin: 0;
				font-weight: 500;
				opacity: 0.9;
			}
		}

		.pricing-container {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 3em;
			align-items: start;
		}

		.card {
			border-radius: 1.5em;
			padding: 2.5em;
			position: relative;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			border: 1px solid transparent;
			backdrop-filter: blur(10px);

			&.competitor-card {
				background: linear-gradient(
					135deg,
					rgba(255, 121, 0, 0.08) 0%,
					rgba(255, 121, 0, 0.03) 100%
				);
				border-color: rgba(255, 121, 0, 0.15);
				opacity: 0.7;
				transform: scale(0.95) translateY(10px);
				filter: grayscale(0.2);

				.competitor-badge {
					position: absolute;
					top: -12px;
					left: 50%;
					transform: translateX(-50%);
					background: var(--primary-600);
					color: white;
					padding: 0.5em 1.5em;
					border-radius: 2em;
					font-size: 0.9rem;
					font-weight: 600;
					box-shadow: 0 4px 12px var(--primary-200);
					white-space: nowrap;
					z-index: 1;
				}

				.card-header h3 {
					color: var(--primary-600);
					font-size: 1.3rem;
					margin: 0 0 1rem 0;
					text-align: center;
					opacity: 0.8;
				}

				.price-tag.crossed-out {
					position: relative;
					text-align: center;
					margin-bottom: 1.5rem;
					opacity: 0.6;
					filter: grayscale(0.3);

					.currency,
					.amount,
					.period {
						color: var(--primary-600);
						position: relative;
					}

					.currency {
						font-size: 1.2rem;
					}

					.amount {
						font-size: 2.5rem;
						font-weight: 700;
						text-decoration: line-through;
						text-decoration-color: var(--primary-600);
						text-decoration-thickness: 3px;
					}

					.period {
						font-size: 1rem;
						opacity: 0.8;
					}
				}

				.features-list.limited {
					li.limited-feature {
						color: var(--primary-600);
						opacity: 0.6;
						position: relative;

						&::before {
							content: '❌';
							color: var(--primary-600);
							font-weight: bold;
							font-size: 0.9rem;
							margin-right: 0.5em;
						}

						// Alternative: utiliser un emoji plus subtil
						// &::before {
						//     content: '⚠️';
						//     filter: grayscale(1);
						// }
					}
				}
			}

			&.our-card {
				background: linear-gradient(
					135deg,
					rgba(255, 255, 255, 0.95) 0%,
					rgba(255, 255, 255, 0.8) 100%
				);
				border-color: var(--primary-300);
				box-shadow:
					0 20px 40px rgba(0, 0, 0, 0.1),
					0 8px 16px rgba(0, 0, 0, 0.05),
					inset 0 1px 0 rgba(255, 255, 255, 0.5);

				&.featured {
					transform: scale(1.05);
					z-index: 2;
				}

				.badge {
					position: absolute;
					top: -12px;
					left: 50%;
					transform: translateX(-50%);
					background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
					color: white;
					padding: 0.5em 1.5em;
					border-radius: 2em;
					font-size: 0.9rem;
					font-weight: 600;
					box-shadow: 0 4px 12px var(--primary-200);
				}

				.card-header {
					text-align: center;
					margin-bottom: 2em;

					h2 {
						font-size: 2rem;
						color: var(--primary-800);
						font-weight: 700;
						margin: 1rem 0;
					}

					.price-tag.free {
						margin: 1.5rem 0;

						.amount {
							font-size: 3rem;
							font-weight: 800;
							background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
							-webkit-background-clip: text;
							-webkit-text-fill-color: transparent;
							background-clip: text;
							display: block;
							line-height: 1;
						}

						.period {
							font-size: 1.1rem;
							color: var(--primary-600);
							font-weight: 500;
							display: block;
							margin-top: 0.5rem;
						}
					}

					.card-description {
						color: var(--primary-700);
						font-size: 1.1rem;
						line-height: 1.6;
						text-wrap: balance;
						margin: 0;
					}
				}

				.features-list {
					list-style: none;
					padding: 0;
					margin: 0 0 2em 0;

					li {
						display: flex;
						align-items: center;
						gap: 1em;
						font-size: 1.1rem;
						color: var(--primary-800);
						margin-bottom: 1rem;
						padding: 0.5em 0;

						&::before {
							content: '✓';
							color: var(--primary-500);
							font-weight: bold;
							font-size: 1.2rem;
							width: 1.5em;
							height: 1.5em;
							border-radius: 50%;
							background: var(--primary-100);
							display: flex;
							align-items: center;
							justify-content: center;
							flex-shrink: 0;
						}
					}
				}

				.cta-section {
					text-align: center;
					padding-top: 1.5em;
					border-top: 1px solid var(--primary-200);

					h3 {
						font-size: 1.3rem;
						color: var(--primary-800);
						margin: 0 0 1.5rem 0;
						font-weight: 600;
					}

					.cta-button {
						background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
						color: white;
						border: none;
						padding: 1.2em 3em;
						border-radius: 2em;
						font-size: 1.1rem;
						font-weight: 700;
						letter-spacing: 0.5px;
						cursor: pointer;
						position: relative;
						overflow: hidden;
						transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
						width: 100%;
						text-transform: uppercase;

						&::before {
							content: '';
							position: absolute;
							top: 0;
							left: -100%;
							width: 100%;
							height: 100%;
							background: linear-gradient(
								90deg,
								transparent,
								rgba(255, 255, 255, 0.2),
								transparent
							);
							transition: left 0.5s;
						}

						&:hover {
							transform: translateY(-3px);
							box-shadow:
								0 16px 32px var(--primary-500),
								0 8px 16px var(--primary-400),
								inset 0 1px 0 rgba(255, 255, 255, 0.3);
							background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);

							&::before {
								left: 100%;
							}
						}

						&:active {
							transform: translateY(-1px);
							box-shadow:
								0 8px 16px var(--primary-200),
								0 4px 8px var(--primary-100);
						}
					}
				}
			}
		}
	}

	@media screen and (max-width: 1000px) {
		section.plan {
			.pricing-container {
				grid-template-columns: 1fr;
				gap: 2em;

				.card.our-card.featured {
					transform: none;
					order: -1;
				}

				.card.competitor-card {
					transform: none;
					opacity: 1;
				}
			}
		}
	}

	@media screen and (max-width: 800px) {
		section.plan {
			padding: 4em 1em;

			.plan-header {
				margin-bottom: 3em;

				h1 {
					font-size: 2.5rem;
				}

				.plan-subtitle {
					font-size: 1.1rem;
				}
			}

			.card {
				padding: 2em;

				&.our-card {
					.card-header h2 {
						font-size: 1.6rem;
					}

					.cta-section .cta-button {
						padding: 1em 2em;
					}
				}
			}
		}
	}

	@media screen and (max-width: 500px) {
		section.plan {
			padding: 3em 1em;

			.plan-header h1 {
				font-size: 2rem;
			}

			.card {
				padding: 1.5em;

				&.our-card {
					.card-header {
						.price-tag.free .amount {
							font-size: 2.5rem;
						}
					}

					.features-list li {
						font-size: 1rem;
					}
				}
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		section.plan {
			background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%);

			.plan-header {
				h1 {
					background: linear-gradient(135deg, var(--primary-200) 0%, var(--primary-100) 100%);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
				}

				.plan-subtitle {
					color: var(--primary-300);
				}
			}

			.card {
				&.competitor-card {
					background: linear-gradient(
						135deg,
						rgba(255, 121, 0, 0.2) 0%,
						rgba(255, 121, 0, 0.1) 100%
					);
					border-color: rgba(255, 121, 0, 0.3);

					.card-header h3 {
						color: var(--primary-300);
					}

					.features-list.limited li.limited-feature {
						color: var(--primary-400);
					}
				}

				&.our-card {
					background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
					border-color: var(--primary-600);

					.card-header {
						h2 {
							color: var(--primary-100);
						}

						.card-description {
							color: var(--primary-300);
						}
					}

					.badge {
						box-shadow: 0 4px 12px var(--primary-600);
					}

					.features-list li {
						color: var(--primary-200);
					}

					.cta-section {
						border-top-color: var(--primary-700);

						h3 {
							color: var(--primary-200);
						}
					}
				}
			}
		}
	}
</style>
