<script>
	let { title } = $props();

	let isHovered = $state(false);
	let x = $state(0);
	let y = $state(0);

	function mouseOver(event) {
		isHovered = true;
		x = event.pageX + 5;
		y = event.pageY + 5;
	}
	function mouseMove(event) {
		x = event.pageX + 5;
		y = event.pageY + 5;
	}
	function mouseLeave() {
		isHovered = false;
	}
</script>

<div
	class="tooltip-container"
	on:mouseover={mouseOver}
	on:mouseleave={mouseLeave}
	on:mousemove={mouseMove}
>
	<slot />
</div>

{#if isHovered}
	<div class="tooltip" style="top: {y + 15}px; left: {x + 15}px;">{title}</div>
{/if}

<style lang="scss">
	.tooltip {
		border: 1px solid var(--primary-900);
		box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
		background: var(--primary-400);
		border-radius: 4px;
		padding: 4px;
		position: absolute;
		color: var(--primary-900);
	}

	@media (prefers-color-scheme: dark) {
		.tooltip {
			background: var(--primary-100);
			border: 1px solid var(--primary-100);
		}
	}
</style>
