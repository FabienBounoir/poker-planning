<script>
	import '../app.scss';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { Toaster } from 'svelte-sonner';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import NotificationCenter from '$lib/components/NotificationCenter.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	let { children } = $props();

	onMount(() => {
		injectAnalytics();

		if ('serviceWorker' in navigator) {
			window.addEventListener('load', function () {
				navigator.serviceWorker
					.register('service-worker.js')
					.then(
						function (registration) {
							if (navigator.onLine) {
								registration.update();
							}
						},
						function (err) {
							console.log('Worker registration failed', err);
						}
					)
					.catch(function (err) {
						console.log(err);
					});
			});
		}
	});
</script>

<Toaster position="top-center" richColors />
<Menu />

<NotificationCenter />

{@render children()}
