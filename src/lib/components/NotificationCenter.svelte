<script>
	import { onMount } from 'svelte';
	import ScrollText from './ScrollText.svelte';
	import { backOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	let notification = $state();
	let errorType = $state('info');

	onMount(() => {
		const notificationInfo = import.meta.env.VITE_NOTIFICATION;

		if (notificationInfo) {
			const notificationParsed = JSON.parse(notificationInfo);
			const { messages, type } = notificationParsed;
			if (type) {
				errorType = type;
			}

			if (messages) {
				for (const lang of window.navigator.languages) {
					if (messages[lang]) {
						notification = messages[lang];
						break;
					}
				}
			}
		}
	});
</script>

{#if notification}
	<div class="notification-center {errorType}" in:fly|local={{ easing: backOut, y: -25 }}>
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
