<script>
	import { onMount } from 'svelte';

	let {
		content,
		cardSelected = $bindable(),
		submittedLetter = $bindable(),
		height = '20vh',
		interact = true,
		style = '',
		clickHandler = null,
		canRemove = true
	} = $props();

	let customTheme = $state('');

	onMount(() => {
		const today = new Date();
		if (
			(today.getMonth() === 9 && today.getDate() >= 15) ||
			(today.getMonth() === 10 && today.getDate() <= 1)
		) {
			customTheme = 'halloween';
		}
	});
</script>

<main
	class="card"
	class:gray={cardSelected && cardSelected != content}
	class:selected={cardSelected === content}
	class:submit={submittedLetter === content}
	class:interact
	class:halloween={customTheme === 'halloween'}
	style="--card-height: {height}; {style}"
	on:click={() => {
		if (cardSelected === content) {
			if (!canRemove) return;
			cardSelected = null;
		} else {
			cardSelected = content;
		}

		if (clickHandler) {
			clickHandler();
		}
	}}
>
	<p>{`${content}`.slice(0, 3)}</p>
</main>

<style lang="scss">
	.card {
		scroll-snap-align: start;

		user-select: none;
		height: var(--card-height, 20dvh);
		aspect-ratio: 2.5 / 4;
		background-color: var(--primary-200);
		border: 1px solid #ddd;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 16px;
		cursor: pointer;
		transition:
			filter 0.3s,
			scale 0.3s,
			background-color 3s !important;

		&.halloween {
			background:
				url(/easterEgg/spider_top.webp) no-repeat,
				url(/easterEgg/spider_bottom.webp) no-repeat right bottom,
				var(--primary-200);
			background-size: contain;
		}

		&:not(.interact) {
			pointer-events: none;
		}

		&:hover {
			scale: 1.05;
		}

		p {
			font-size: calc(var(--card-height, 20dvh) / 2.8);
			color: var(--primary-600);
		}

		&.selected {
			scale: 1.05;
		}

		&.gray {
			filter: grayscale(1);
		}

		&.submit {
			border: 3px solid var(--primary-700);
		}
	}

	@media screen and (max-width: 500px) {
		.card {
			aspect-ratio: auto;
			width: 90vw;
			height: auto;
		}
	}

	@media (prefers-color-scheme: dark) {
		.card {
			background-color: var(--primary-800);
			border-color: #333;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

			&.halloween {
				background:
					url(/easterEgg/spider_top.webp) no-repeat,
					url(/easterEgg/spider_bottom.webp) no-repeat right bottom,
					var(--primary-800);
				background-size: contain;
			}

			p {
				color: var(--primary-200);
			}
		}

		.submit {
			border: 3px solid var(--primary-500) !important;
		}
	}
</style>
