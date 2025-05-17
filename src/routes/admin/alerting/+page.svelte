<script lang="ts">
	import ScrollText from '$lib/components/ScrollText.svelte';

	let alert = $state({
		type: 'info',
		messages: {
			fr: '',
			en: '',
			es: '',
			de: '',
			it: ''
		}
	});

	function onChange(event) {
		alert.type = event.currentTarget.value;
	}
</script>

<div class="alertingExample">
	{#each Object.entries(alert.messages) as [lang, message]}
		{#if message}
			<div class="alerting {alert.type}">
				<div>
					<ScrollText text={message} />
				</div>
			</div>
		{/if}
	{/each}
</div>

<main>
	<h1>Generate alerting</h1>

	<div class="type-list">
		<div class="type-list-item">
			<input type="radio" name="info" id="alerting" value="info" on:change={onChange} />
			<label for="alerting">Info</label>
		</div>
		<div class="type-list-item">
			<input type="radio" name="info" id="warning" value="warning" on:change={onChange} />
			<label for="warning">Warning</label>
		</div>
		<div class="type-list-item">
			<input type="radio" name="info" id="error" value="error" on:change={onChange} />
			<label for="error">Error</label>
		</div>
		<div class="type-list-item">
			<input type="radio" name="info" id="success" value="success" on:change={onChange} />
			<label for="success">Success</label>
		</div>
	</div>

	{#each Object.entries(alert.messages) as [lang, message]}
		<div class="alert-list-item">
			<h3>Langue {lang}</h3>
			<textarea
				rows="1"
				placeholder="Texte à afficher"
				on:input={(e) => {
					alert.messages[lang] = e.currentTarget.value;
				}}
			></textarea>
		</div>
	{/each}

	<pre>
		{JSON.stringify(alert)}
	</pre>
</main>

<style lang="scss">
	pre {
		background-color: var(--primary-200);
		margin-top: 1rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		width: 95dvw;
	}

	.alertingExample {
		// position: fixed;
		// top: 0;
		z-index: 99999;
		display: flex;
		flex-direction: column;
		gap: 3px;

		.alerting {
			width: 100dvw;
			> div {
				padding: 0.5rem;
				border-radius: 0.5rem;
				font-size: 0.9rem;
				width: 95dvw;
				overflow: hidden;
				white-space: nowrap;
				position: relative;
			}
		}
	}

	button {
		position: relative;
	}

	.info {
		background-color: #007bff;
	}

	.success {
		background-color: #28a745;
	}

	.warning {
		background-color: #ffc107;
		color: black;
	}

	.error {
		background-color: #dc3545;
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 2rem;
		text-align: center;
		scale: 0;
		animation: scale 0.5s forwards 0.2s;

		@keyframes scale {
			0% {
				scale: 0;
			}

			100% {
				scale: 1;
			}
		}
	}

	h1 {
		font-weight: 900;
		font-size: 2em;
		padding-bottom: 1em;
		color: var(--primary-950);

		.animateDetective {
			display: inline-block;
			animation: bounceRotate 2s infinite;

			@keyframes bounceRotate {
				0% {
					transform: translateY(0) rotate(0deg); /* Position initiale */
				}
				25% {
					transform: translateY(-10px) rotate(5deg); /* Légère élévation et rotation vers la droite */
				}
				50% {
					transform: translateY(0) rotate(-5deg); /* Retour à la position normale avec rotation vers la gauche */
				}
				75% {
					transform: translateY(2px) rotate(4deg); /* Élément un peu plus bas avec rotation vers la droite */
				}
				100% {
					transform: translateY(0) rotate(0deg); /* Retour à la position initiale */
				}
			}
		}
	}

	.alert-list-item {
		width: auto;
		h3 {
			text-align: left;
		}
	}

	.type-list {
		display: flex;
		flex-direction: row;
		gap: 1rem;

		.type-list-item {
			display: flex;
			flex-direction: row;
			gap: 0.3rem;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			background-color: var(--primary-200);
			border-radius: 0.5rem;
			padding: 0.5rem;
		}
	}

	@media (prefers-color-scheme: dark) {
		main {
			h1 {
				color: var(--primary-200);
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
