<script lang="ts">
	import ScrollText from '$lib/components/ScrollText.svelte';

	let path = $state('/');

	let alert = $state({
		type: 'info',
		messages: {
			en: '',
			fr: '',
			es: '',
			de: '',
			it: ''
		},
		path: [],
		startDate: null,
		endDate: null
	});

	let limitedTime = $state(false);

	function onChange(event) {
		alert.type = event.currentTarget.value;
	}

	function formatAlert() {
		const alertMapper = JSON.parse(JSON.stringify(alert));

		if (alertMapper.path.length === 0) {
			alertMapper.path = undefined;
		}

		if (!limitedTime) {
			alertMapper.startDate = undefined;
			alertMapper.endDate = undefined;
		} else {
			if (!alertMapper.startDate) {
				alertMapper.startDate = undefined;
			}
			if (!alertMapper.endDate) {
				alertMapper.endDate = undefined;
			}
		}

		for (const lang in alertMapper.messages) {
			if (!alertMapper.messages[lang]) {
				delete alertMapper.messages[lang];
			}
		}

		return alertMapper;
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
	<div class="container">
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

		<div>
			<h3>Specific Path</h3>

			<input type="text" placeholder="Path" bind:value={path} />
			<div class="buttons">
				<button
					on:click={() => {
						if (path) {
							alert.path.push(path);
							path = '';
						}
					}}
				>
					add path
				</button>

				<button
					on:click={() => {
						alert.path = [];
					}}
				>
					clear path
				</button>
			</div>

			<div class="path-list">
				{#each alert.path as p}
					<p class="path-list-item" on:click={() => alert.path.splice(alert.path.indexOf(p), 1)}>
						{p}
					</p>
				{/each}
			</div>
		</div>

		<div>
			<h3>Limited Time</h3>
			<input type="checkbox" bind:checked={limitedTime} />
			{#if limitedTime}
				<div>
					<input
						type="datetime-local"
						bind:value={alert.startDate}
						on:change={(e) => {
							alert.startDate = e.currentTarget.value;
						}}
					/>
					<input
						type="datetime-local"
						bind:value={alert.endDate}
						on:change={(e) => {
							alert.endDate = e.currentTarget.value;
						}}
					/>
				</div>
			{/if}
		</div>

		<button
			on:click={() => {
				const alertMapper = formatAlert();
				navigator.clipboard.writeText(JSON.stringify(alertMapper));
			}}
		>
			Copy to clipboard
		</button>
	</div>
</main>

<style lang="scss">
	.buttons {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}

	.path-list {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		flex-wrap: wrap;

		.path-list-item {
			background-color: var(--primary-200);
			padding: 0.5rem;
			border-radius: 0.5rem;
			cursor: pointer;
		}
	}

	textarea,
	input {
		width: -webkit-fill-available;
	}

	pre {
		background-color: var(--primary-200);
		margin-top: 1rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		text-wrap: auto;
	}

	.alertingExample {
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
		text-align: left;
		scale: 0;
		animation: scale 0.5s forwards 0.2s;

		.container {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			width: 95dvw;
			max-width: 800px;
			padding: 1rem;
			border-radius: 0.5rem;
		}

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
