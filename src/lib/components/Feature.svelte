<script>
	let { title, description, invert = false, children } = $props();
</script>

<section class="module">
	<div class="container {invert ? 'inverte' : ''}">
		<div class="description">
			<h2>{title}</h2>
			<p>
				{description}
			</p>
		</div>
		<div class="preview">
			{@render children()}
		</div>
	</div>
</section>

<style lang="scss">
	section.module {
		height: 62vh;
		width: 100%;
		background-color: var(--primary-200);
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		gap: 3rem;
		text-align: left;
		margin: auto;

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
			margin-top: 6em !important;
			width: 80%;
			background-color: var(--primary-50);
			border-radius: 1em;
			color: var(--primary-950);

			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-areas: 'description preview';

			div.description {
				grid-area: description;
				display: flex;
				flex-direction: column;
				justify-content: space-evenly;

				padding: 2em;
				h2 {
					font-size: 2.5em;
					color: var(--primary-950);
				}

				p {
					font-size: 1em;
					color: var(--primary-800);
					margin: 0;
					text-wrap: balance;
				}
			}

			div.preview {
				grid-area: preview;
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 2em;
			}

			&.inverte {
				flex-direction: row-reverse;
				grid-template-areas: 'preview description';
				div.preview {
					img {
						transform: translate(-4rem);
					}
				}
			}
		}
	}

	@media screen and (max-width: 1000px) {
		section.module {
			min-height: 75vh;
			h2 {
				font-size: 1.5rem !important;
			}

			div.container {
				width: 90%;
				grid-template-columns: 1fr;
				grid-template-areas: 'preview' 'description' !important;

				div.preview {
					padding: 2em 2em 0 2em;
					img {
						transform: translateY(-4em) !important;
						max-width: 50vh;
					}
				}

				div.description {
					padding: 0em 2em 2em 2em;
				}
			}

			&.inverte {
				grid-template-columns: 1fr;
				grid-template-areas: 'preview' 'description' !important;
				div.preview {
					padding: 2em 2em 0 2em !important;
				}
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		section.module {
			background-color: var(--primary-900);
			color: var(--primary-50);
		}
	}

	@media screen and (max-height: 900px) and (max-width: 1000px) {
		section.module {
			height: auto !important;
		}
	}
</style>
