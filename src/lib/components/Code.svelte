<script>
	import { fade, scale } from 'svelte/transition';
	let { code = 'XXX-XXX', url, hexcode } = $props();
	import { _ } from 'svelte-i18n';
	import { toast } from 'svelte-sonner';

	let displayQrCode = $state(false);
	let copied = $state(false);

	const displayCopyToClipboard = async () => {
		if (!url) return;
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
		} catch (error) {
			toast.error($_('RoomPage.copyError'));
			console.error('Failed to copy!', error);
		} finally {
			setTimeout(() => {
				copied = false;
			}, 700);
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
		<h3 class:copied style="--copy-text: '{$_('ManagerPage.copied')}';">
			<span class="code__text">{code}</span>
		</h3>
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
		<h3 in:scale>{code}</h3>
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
		z-index: 100;
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
			background: var(--primary-200);
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
			border: 1px solid var(--primary-200);
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
				position: relative;
				font-size: 2em;
				color: var(--primary-600);
				font-weight: 900;
				line-height: 14px;

				&.copied {
					.code__text {
						visibility: hidden;
					}

					&::after {
						content: var(--copy-text);
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
					}
				}
			}
		}
	}

	@media (prefers-color-scheme: dark) {
		.code-element {
			color: var(--primary-200) !important;
			.code-container {
				border-color: var(--primary-700);
				color: var(--primary-200) !important;
				h3 {
					color: var(--primary-200) !important;
				}
			}

			button {
				color: var(--primary-200) !important;
			}
		}

		p {
			color: var(--primary-200) !important;
		}

		.fullscreen {
			h3 {
				color: var(--primary-200) !important;
			}
		}
	}
</style>
