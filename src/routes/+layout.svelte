<script>
	import '../app.scss';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { Toaster } from 'svelte-sonner';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';
	let { children } = $props();
	let hasPokerHistory = $state(false);

	onMount(() => {
		injectAnalytics();

		const pokerHistory = Object.keys(window.localStorage).filter((key) =>
			key.startsWith('PP_HISTORY')
		);

		if (pokerHistory.length) {
			hasPokerHistory = true;
		}
	});
</script>

<Toaster position="top-center" richColors />
<div class="menu">
	{#if PACKAGE_JSON?.version}
		<a
			title={$_('layout.versionLink')}
			href="https://github.com/FabienBounoir/poker-planning"
			class="version"
			target="_blank"
			rel="noopener noreferrer">v{PACKAGE_JSON.version}</a
		>
	{/if}

	{#if $page.route.id !== '/'}
		<a title={$_('layout.homeLink')} href="/" class="version"><i class="fa-solid fa-house"></i></a>
	{/if}

	{#if hasPokerHistory}
		<a title={$_('layout.historyLink')} href="/pokerhistory" class="version"
			><i class="fa-solid fa-history"></i></a
		>
	{/if}

	{#if $page.route.id !== '/feedback'}
		<a title={$_('layout.feedbackLink')} target="_blank" href="/feedback" class="version"
			><i class="fa-solid fa-question"></i></a
		>
	{/if}
</div>

{@render children()}

<style lang="scss">
	.menu {
		position: fixed;
		top: 0;
		left: 0;
		margin: 1em 1.5em;
		font-weight: 700;
		color: var(--primary-950);
		z-index: 9980;
		cursor: pointer;

		display: flex;
		gap: 0.5em;

		a {
			border-radius: 9999px;
			background: linear-gradient(
				120deg,
				var(--primary-200),
				var(--primary-400),
				var(--primary-700)
			);
			background-size: 200% 200%;
			animation: shimmer 5s infinite alternate;
			padding: 0.3em 0.7em;
			text-decoration: none;
		}

		a:hover {
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
		.menu {
			top: 0;
			right: 0;
			left: auto;
			flex-direction: row-reverse;
		}
	}

	@media screen and (max-width: 500px) {
		.menu {
			display: none;
		}
	}
</style>
