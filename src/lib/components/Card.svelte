<script>
	let { content, cardSelected = $bindable() } = $props();
</script>

<main
	class="card"
	class:gray={cardSelected && cardSelected != content}
	class:selected={cardSelected === content}
	on:click={() => {
		if (cardSelected === content) {
			cardSelected = null;
		} else {
			cardSelected = content;
		}
	}}
>
	<p>{content}</p>
</main>

<style lang="scss">
	.card {
		user-select: none;
		height: 20dvh;
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
			scale 0.3s;

		&:hover {
			scale: 1.05;
		}

		p {
			font-size: 7dvh;
			color: var(--primary-600);
		}

		&.selected {
			scale: 1.05;
		}

		&.gray {
			filter: grayscale(1);
		}
	}
</style>
