<script>
	import { onMount } from 'svelte';
	import ScrollText from './ScrollText.svelte';
	import { backOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { getNotifications } from '$lib/notifications.js';
	import { navigating } from '$app/stores';

	let notification = $state();
	let errorType = $state('info');

	onMount(() => {
		checkNotifications();
	});

	$effect(() => {
		$navigating;

		if (window) {
			checkNotifications();
		}
	});

	const checkNotifications = () => {
		const path = window.location.pathname;
		const { message, type } = getNotifications(path);

		if (message) {
			notification = message;
			if (type) {
				errorType = type;
			}
		} else {
			notification = null;
		}
	};
</script>

{#if notification}
	<div class="notification-center {errorType}" transition:fly|local={{ easing: backOut, y: -25 }}>
		<div class="notification">
			<ScrollText text={notification} />
		</div>
	</div>
{/if}

<style>
	.notification-center {
		position: fixed;
		top: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: 10000;
		width: 100dvw;
		align-items: center;
	}

	.notification {
		padding: 0.5rem;
		border-radius: 0.5rem;
		font-size: 0.9rem;
		width: 95dvw;
		overflow: hidden;
		white-space: nowrap;
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
</style>
