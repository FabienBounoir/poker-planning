<script>
	import { cubicOut, elasticIn, elasticInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	const { pourcentage, item, delay } = $props();

	const progress = tweened(0, {
		delay: 100 * (delay + 1),
		duration: 1400,
		easing: cubicOut
	});

	progress.set(pourcentage);
</script>

<div class="progress-bar">
	<div class="bar" style="right: calc(100% - {$progress}%);"></div>
	<p>{item || '-'}</p>
	<p>{$progress?.toFixed?.()}%</p>
</div>

<style>
	.progress-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--primary-900);
		background-color: var(--primary-200);
		margin-bottom: 0.3em;
		border-radius: 20px;

		padding: 0.5em 1em;
		position: relative;
		overflow: hidden;

		p {
			color: var(--primary-900);
			z-index: 3;

			&:first-of-type {
				font-weight: 800;
			}
		}

		.bar {
			border-radius: 99999px;
			background-color: var(--primary-600);
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
		}
	}
</style>
