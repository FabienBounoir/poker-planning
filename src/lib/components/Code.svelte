<script>
	let { code, url = 'https://coucou.com' } = $props();

	let displayText = $state(code);

	const displayCopyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(url);
			displayText = 'Copied!';

			setTimeout(() => {
				displayText = code;
			}, 300);
		} catch (error) {
			console.error('Failed to copy!', error);
		}
	};
</script>

<p>Le code de votre salle :</p>
<div class="code-container" on:click={displayCopyToClipboard}>
	<h3>{displayText}</h3>
</div>

<style lang="scss">
	.code-container {
		border: 1px solid #ddd;
		width: max-content;
		padding: 1em;
		border-radius: 8px;

		&:hover {
			cursor: pointer;

			h3 {
				filter: blur(0);
			}
		}

		h3 {
			transition:
				filter 0.3s,
				color 3s !important;
			filter: blur(7px);
			font-size: 2em;
			color: var(--primary-600);
			font-size: 2rem;
			font-weight: 900;
			line-height: 14px;
		}
	}
</style>
