<script>
	import { page } from '$app/stores';
	import { scale } from 'svelte/transition';
</script>

<main>
	<h1>Oopsie... 🤓</h1>
	{#if $page?.status !== undefined}
		{#if $page.status === 404}
			<p>cette page n'existe pas...</p>
			<p>Navigue avec les boutons pour explorer d'autres contrées !</p>
			<a href="/">Oh, un bouton, quel miracle !</a>
		{:else if $page.status >= 500}
			<p>
				On dirait que notre serveur a pris une petite pause... Pas de panique, on s'en occupe ! ⚙️
			</p>
		{/if}
	{:else}
		<p>
			{$page.error?.message}
		</p>
	{/if}
	{#if import.meta.env.DEV}
		<pre>{JSON.stringify($page.error?.stack, null, 2)}</pre>
	{/if}
</main>

<style lang="scss">
	main {
		text-align: center;
		padding: 15vw;
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 1.5em;
		a {
			margin-top: 4em;
			color: var(--primary-500);
			border-radius: 5px;
			background-color: var(--primary-500);
			color: var(--primary-950);
			text-decoration: none;
			font-weight: 600;

			padding: 0.5rem 0.75rem;
			border-radius: 0.5rem;

			&:hover {
				animation: scaleShake 1s infinite;

				@keyframes scaleShake {
					0% {
						transform: scale(1) rotate(0deg);
					}
					25% {
						transform: scale(1.05) rotate(5deg);
					}
					50% {
						transform: scale(1) rotate(-5deg);
					}
					75% {
						transform: scale(1.05) rotate(2deg);
					}
					100% {
						transform: scale(1) rotate(0deg);
					}
				}
			}
		}

		h1 {
			font-size: 2em;
			color: var(--primary-800);
		}

		p {
			color: var(--primary-600);
		}
	}
</style>
