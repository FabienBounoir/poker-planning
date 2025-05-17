<script>
	import { onDestroy, onMount } from 'svelte';

	const { text } = $props();
	let animate = $state(false);
	let textEl;

	function checkOverflow() {
		if (textEl && textEl.scrollWidth > textEl.clientWidth) {
			animate = true;
		} else {
			animate = false;
		}
	}

	onMount(() => {
		checkOverflow();
		window.addEventListener('resize', () => {
			checkOverflow();
		});
	});

	onDestroy(() => {
		if (window) {
			checkOverflow();
		}
	});
</script>

<div class="container" class:scrolling-text={animate} bind:this={textEl}>
	{@html text}
</div>

<style>
	.container {
		text-align: center;
	}

	.scrolling-text {
		display: inline-block;
		padding-left: 100%;
		animation: scroll 15s linear infinite;
	}

	@keyframes scroll {
		0% {
			transform: translateX(0%);
		}
		100% {
			transform: translateX(-100%);
		}
	}
</style>
