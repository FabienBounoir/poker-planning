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
	});
</script>

<Toaster position="top-center" richColors />
<Menu />

<NotificationCenter />

{@render children()}
