<script>
	import { fade, scale } from 'svelte/transition';
	let { code, url = 'https://coucou.com' } = $props();
	import { _ } from 'svelte-i18n';

	let displayText = $state(code);
	let displayQrCode = $state(false);

	const displayCopyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(url);
			displayText = $_('ManagerPage.copied');

			setTimeout(() => {
				displayText = code;
			}, 700);
		} catch (error) {
			console.error('Failed to copy!', error);
		}
	};

	/**
	 * Retrieves the CSS color value for a given CSS variable.
	 *
	 * @param {string} variable - The name of the CSS variable to retrieve the color value for.
	 * @returns {string} The CSS color value associated with the given variable.
	 */
	const getCssColor = (variable) => {
		const root = document.documentElement;
		const hexaCode = getComputedStyle(root).getPropertyValue(variable).trim();
		return hexaCode.slice(1);
	};
</script>

<p>{$_('ManagerPage.roomCode')}</p>
<div class="code-element">
	<div class="code-container" on:click={displayCopyToClipboard}>
		<h3>{displayText}</h3>
	</div>
	<button
		aria-label="Display QrCode"
		on:click={() => {
			displayQrCode = true;
		}}
	>
		<i class="fa-solid fa-qrcode"></i>
	</button>
</div>
{#if displayQrCode}
	<div class="fullscreen" on:click={() => (displayQrCode = false)} transition:fade>
		<img
			alt="QR Code for joining the room"
			in:scale
			src={`https://api.qrserver.com/v1/create-qr-code/?size=700x700&bgcolor=${getCssColor('--primary-200')}&margin=50&color=${getCssColor('--primary-950')}&data=${encodeURIComponent(url)}`}
		/>
		<h3 in:scale>{displayText}</h3>
	</div>
{/if}

<style lang="scss">
	.fullscreen {
		position: fixed;
		width: 100vw;
		height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 2em;
		backdrop-filter: blur(7px) brightness(80%);
		top: 0;
		left: 0;
		z-index: 10;
		cursor: pointer;

		h3 {
			font-size: 2em;
			color: var(--primary-800);
			font-weight: 900;
			line-height: 14px;
		}

		img {
			border-radius: 5px;
			width: 30vh;
			height: 30vh;
			cursor: pointer;
		}
	}

	.code-element {
		position: initial;
		display: flex;
		flex-direction: row;
		gap: 0.3em;
		align-items: center;

		button {
			background-color: transparent;
			border: 0px;
			transition: scale 0.3s !important;
			outline: none;
			i {
				font-size: 2em;
				cursor: pointer;
			}

			&:active {
				scale: 1.1;
			}
		}

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
				font-weight: 900;
				line-height: 14px;
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		.code-element {
			color: var(--primary-200) !important;
			.code-container {
				border-color: #333;
				color: var(--primary-200) !important;
				h3 {
					color: var(--primary-200) !important;
				}
			}

			button {
				color: var(--primary-200) !important;
			}
		}
	}
</style>
