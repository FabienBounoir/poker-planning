<script>
	import { Toaster } from 'svelte-sonner';
	import '../app.scss';
</script>

<Toaster position="top-center" richColors />
<span class="beta">BETA</span>
<slot></slot>

<style lang="scss">
	.beta {
		position: fixed;
		top: 0;
		right: 0;
		margin: 1em 1.5em;
		border-radius: 9999px;
		background: linear-gradient(120deg, var(--primary-200), var(--primary-500), var(--primary-800));
		background-size: 200% 200%;
		animation: shimmer 5s infinite alternate;
		padding: 0.3em 0.7em;
		font-weight: 700;
		color: var(--primary-950);
	}

	@keyframes shimmer {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 100% 50%;
		}
	}

	@media screen and (max-width: 500px) {
		.beta {
			display: none;
		}
	}
</style>
