<script>
	import { Toaster } from 'svelte-sonner';
	import '../app.scss';
</script>

<Toaster position="top-center" richColors />
{#if PACKAGE_JSON?.version}
	<a
		href="https://github.com/FabienBounoir/poker-planning"
		class="version"
		target="_blank"
		rel="noopener noreferrer">v{PACKAGE_JSON.version}</a
	>
{/if}
<slot></slot>

<style lang="scss">
	.version {
		position: fixed;
		top: 0;
		left: 0;
		margin: 1em 1.5em;
		border-radius: 9999px;
		background: linear-gradient(120deg, var(--primary-200), var(--primary-500), var(--primary-800));
		background-size: 200% 200%;
		animation: shimmer 5s infinite alternate;
		padding: 0.3em 0.7em;
		font-weight: 700;
		color: var(--primary-950);
		z-index: 9999;
		cursor: pointer;
		text-decoration: none;

		&:hover {
			animation:
				splash 1s ease-in-out infinite,
				shimmer 5s infinite alternate;
		}
	}

	@keyframes splash {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes shimmer {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 100% 50%;
		}
	}

	@media screen and (max-width: 960px) {
		.version {
			top: 0;
			right: 0;
			left: auto;
		}
	}

	@media screen and (max-width: 500px) {
		.version {
			display: none;
		}
	}
</style>
