<script>
	import { fade, scale } from 'svelte/transition';

	let clickCount = $state(0);
	let multiplier = $state(1);
	let displayCookieClick = $state(false);

	let powerUps = [
		{ name: 'Multiplier x2', effect: () => (multiplier *= 2), price: 50, purchased: 0 },
		{ name: 'Auto Clicker', effect: passiveGain, price: 100, purchased: 0 },
		{ name: 'Réduction de prix', effect: reducePrices, price: 300, purchased: 0 },
		{ name: 'Boost temporaire', effect: temporaryBoost, price: 200, purchased: 0 }
	];

	$effect(() => {
		if (clickCount > 10) {
			displayCookieClick = true;
		}
	});

	function buyPowerUp(index) {
		const powerUp = powerUps[index];
		if (clickCount >= powerUp.price) {
			clickCount -= powerUp.price;
			powerUp.effect();
			powerUp.purchased++;
			powerUp.price = Math.floor(powerUp.price * 1.5);
		}
	}

	function reducePrices() {
		powerUps.forEach((powerUp) => {
			powerUp.price = Math.floor(powerUp.price * 0.8);
		});
	}

	function temporaryBoost() {
		let originalMultiplier = multiplier;
		multiplier *= 2;
		setTimeout(() => {
			multiplier = originalMultiplier;
		}, 30000);
	}

	function passiveGain() {
		setInterval(() => {
			clickCount += 1;
		}, 1000);
	}
</script>

<svg
	width="12vw"
	viewBox="0 0 128 170"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	on:click={() => (clickCount += multiplier)}
>
	<path
		d="M68.3537 0.897253C67.6531 1.53111 66.8191 2.06489 66.4855 2.06489C64.7507 2.06489 64.2837 3.26589 65.6848 4.19999C66.1185 4.50024 66.6857 5.33427 66.8858 6.06821C67.4863 8.06987 67.9868 8.3034 69.0543 7.06904C69.6214 6.43518 70.5556 5.90141 71.4229 5.66788C73.091 5.26755 73.3245 4.46688 72.0234 3.5995C71.5897 3.29925 71.0226 2.46522 70.8224 1.73128C70.1886 -0.337104 69.7882 -0.470548 68.3537 0.897253Z"
		fill="var(--first-color)"
	/>
	<path
		d="M84.2002 5.9681C83.3328 8.37009 82.7323 9.3042 81.498 10.1382C79.5964 11.4727 79.7632 12.24 82.0651 12.9739C83.5663 13.441 84.1668 13.8413 85.0009 14.9756C85.568 15.7429 86.2352 16.4435 86.4688 16.5435C87.0359 16.8104 87.8699 16.4101 87.8699 15.9097C87.8699 14.642 89.2044 12.5069 90.5054 11.6395C92.4404 10.3718 92.3069 9.43764 90.0717 8.77042C88.8707 8.40345 88.1034 7.86968 87.1026 6.66868C85.568 4.83382 84.6673 4.63366 84.2002 5.9681Z"
		fill="var(--first-color)"
	/>
	<path
		d="M91.5452 140C91.5452 135.2 88.8785 132 87.5452 131L97.0452 129.5L99.5452 134.5C101.545 138.5 99.3785 147.5 98.0452 151.5C101.645 155.1 103.169 157.747 103.545 158.5C104.045 159.5 103.745 161.5 102.545 163.5C101.345 165.5 98.5452 164.5 97.5452 163.5C96.2118 161.667 92.9452 157.5 90.5452 155.5C88.1452 153.5 88.8785 151 89.5452 150C90.2118 148.667 91.5452 144.8 91.5452 140Z"
		fill="var(--second-color)"
	/>
	<path
		d="M70.0452 143.5C70.0452 142.5 65.8785 137.667 63.5452 137L69.0452 130.5C77.0452 134 78.1174 142.075 78.5452 144C79.3452 147.6 76.8785 155.833 75.5452 159.5C79.1452 161.1 80.3785 162.833 80.5452 163.5C82.1452 170.3 77.5452 170.333 75.0452 169.5L67.5452 165C65.0452 163 66.2118 159.833 66.5452 158.5C70.5452 148.5 70.0452 144.5 70.0452 143.5Z"
		fill="var(--second-color)"
	/>
	<path
		d="M120.545 90.5L110.545 101L111.545 110.5C115.712 108.833 123.045 101.5 126.545 95.5C130.545 88.6429 122.045 88 120.545 90.5Z"
		fill="var(--second-color)"
	/>
	<path
		d="M6.54517 112.5C11.1597 115.269 20.7118 117.833 25.5452 118L27.5452 126.5C20.3452 126.9 8.54518 122.406 4.04517 121C-3.95482 118.5 1.54518 109.5 6.54517 112.5Z"
		fill="var(--second-color)"
	/>
	<path
		d="M65.8516 21.4476C58.7791 22.1148 51.6398 27.0523 48.3371 33.591C47.8367 34.5919 47.3029 35.4259 47.1361 35.4259C46.9693 35.4259 46.202 34.9922 45.4681 34.4251C43.3663 32.9238 39.2295 31.4893 35.76 31.0222C21.1145 29.1874 8.37061 42.9321 11.273 57.4442C11.64 59.1789 12.4073 61.4475 13.3414 63.3491C14.1421 65.0505 14.8093 66.485 14.8093 66.5517C14.8093 66.6184 13.6416 67.3857 12.2071 68.2198C5.73509 72.0563 1.56496 78.3615 0.430684 86.1346C-0.536786 92.7401 1.93193 100.747 6.50239 105.918C10.7059 110.688 18.0119 114.158 23.9168 114.158H25.6516L25.685 117.928C25.7183 122.498 26.2855 124.833 28.3872 129.137C29.6883 131.773 30.4556 132.84 32.8242 135.209C36.7608 139.212 40.6974 141.147 46.3354 141.848C52.0735 142.548 58.3788 140.813 63.3496 137.077C65.9851 135.109 68.8208 131.639 70.9559 127.769L72.2236 125.501L73.558 126.335C79.7298 130.271 85.6347 131.672 91.9066 130.705C97.3111 129.904 101.448 127.903 104.817 124.433C108.62 120.496 110.289 117.194 111.423 111.456C111.89 108.92 111.923 107.986 111.623 105.551C111.089 101.214 109.188 96.0762 107.186 93.5074C106.252 92.3064 106.419 91.6726 107.887 90.8385C109.555 89.9044 113.391 86.1346 114.759 84.0996C118.495 78.5283 119.796 71.3891 118.195 64.8503C116.994 59.7794 115.026 56.2432 111.623 52.8737C106.786 48.1031 101.281 45.7678 94.5421 45.5676L91.0392 45.4342L90.839 42.365C90.6055 38.8287 90.0384 36.727 88.3703 33.2574C84.6005 25.3842 75.3595 20.5469 65.8516 21.4476ZM74.4254 68.1197C77.161 69.354 79.8299 72.7902 80.3637 75.8594C80.5638 76.8936 80.4638 77.2272 79.7298 77.9278C79.2628 78.4282 78.6956 78.7952 78.4287 78.7952C77.4613 78.7952 76.2603 77.4608 75.8933 75.9929C75.126 72.8903 71.9233 70.922 69.0543 71.7894C67.4196 72.2898 65.3179 74.2915 65.0176 75.6593C64.5172 77.9612 63.9834 78.962 63.0827 79.2956C61.9818 79.6626 61.2145 79.2956 60.614 78.0946C60.2803 77.4274 60.3137 76.8603 60.6473 75.4591C61.4146 72.0896 62.9826 70.0213 65.8516 68.4533C67.453 67.5859 68.0201 67.4525 70.3554 67.4525C72.257 67.4525 73.4246 67.6526 74.4254 68.1197ZM49.9051 74.8586C52.7408 76.0596 56.2103 80.6301 55.7433 82.5316C55.6098 82.9653 55.1761 83.5325 54.7091 83.766C53.3413 84.4999 52.3738 83.9995 51.1394 81.8978C49.6382 79.3623 48.0035 78.3949 45.6015 78.5617C42.4656 78.7952 40.7308 80.7301 40.2971 84.6334C40.1303 85.9678 39.8634 86.635 39.363 86.9687C37.7283 88.1363 35.8267 86.9019 35.8267 84.6667C35.8267 81.0971 37.9285 77.2272 40.6974 75.5925C43.9001 73.7243 46.6691 73.4908 49.9051 74.8586ZM67.1194 85.4674C68.1202 86.4015 68.1536 89.9044 67.1861 91.7726C64.7841 96.5099 58.4121 97.6108 54.6757 93.9411C52.207 91.5391 51.8734 88.4699 54.0085 87.9361C55.1428 87.6692 56.4772 88.3698 56.7107 89.3706C56.9776 90.4048 58.7124 91.806 59.7466 91.806C60.9142 91.806 62.6156 90.9386 63.1494 90.0712C63.3829 89.6709 63.5831 88.6033 63.5497 87.736C63.5164 85.1338 65.4179 83.8994 67.1194 85.4674Z"
		fill="var(--first-color)"
	/>
</svg>

{#if displayCookieClick}
	<div class="click-count" in:scale={{ duration: 300 }}>Clics: {clickCount}</div>

	<div class="floating-menu" in:fade={{ duration: 500 }}>
		<h3>Power-ups</h3>
		{#each powerUps as powerUp, index}
			<div class="power-up">
				<span>{powerUp.name}</span>
				<button on:click={() => buyPowerUp(index)} disabled={clickCount < powerUp.price}>
					Acheter ({powerUp.price} clics)
				</button>
				<p>Acheté : {powerUp.purchased}</p>
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	.floating-menu {
		position: fixed;
		bottom: 10%;
		right: 5%;
		background: var(--primary-100);
		padding: 1em;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		width: 200px;
		z-index: 1000;

		h3 {
			margin: 0 0 1em;
			font-size: 1.2em;
			color: var(--primary-900);
		}

		.power-up {
			display: flex;
			flex-direction: column;
			margin-bottom: 1em;

			span {
				font-size: 1em;
				margin-bottom: 0.5em;
			}

			button {
				background: var(--primary-500);
				border: none;
				padding: 0.5em;
				border-radius: 4px;
				cursor: pointer;
				transition: background 0.3s;

				&:hover:not(:disabled) {
					background: var(--primary-700);
				}

				&:disabled {
					background: var(--primary-300);
					cursor: not-allowed;
				}
			}

			p {
				margin-top: 0.5em;
				font-size: 0.9em;
				color: var(--primary-700);
			}
		}
	}

	.click-count {
		position: fixed;
		top: 0%;
		right: 0%;
		width: max-content;
		padding: 0.5em 1em;
		margin: 1em 1.5em;
		background: linear-gradient(120deg, var(--primary-200), var(--primary-400), var(--primary-700));
		border-radius: 0.5em;
		background-size: 200% 200%;
		animation: shimmer 5s infinite alternate;
		font-weight: bold;
		user-select: none;

		@keyframes shimmer {
			0% {
				background-position: 0% 50%;
			}
			100% {
				background-position: 100% 50%;
			}
		}
	}

	svg {
		position: absolute;
		top: 50%;
		left: 10%;
		transform: translateY(-50%);
		animation: float 5s ease-in-out infinite; /* Animation de flottaison */
		transform-origin: center;
		transition: scale 0.3s !important;
		cursor: pointer;

		--first-color: var(--primary-950);
		--second-color: var(--primary-500);

		&:active {
			scale: 1.1;
		}
	}

	@keyframes float {
		0% {
			transform: translateY(-50%) rotate(0deg);
		}
		50% {
			transform: translateY(-40%) rotate(10deg);
		}
		100% {
			transform: translateY(-50%) rotate(0deg);
		}
	}

	@keyframes floatMobile {
		0% {
			transform: translateY(0%) rotate(0deg);
		}
		50% {
			transform: translateY(7%) rotate(10deg);
		}
		100% {
			transform: translateY(0%) rotate(0deg);
		}
	}

	@media (max-width: 1150px) {
		svg {
			position: initial;
			width: 15vw;
			margin-bottom: 5em;
			transform: translateY(0);
			animation: floatMobile 5s ease-in-out infinite;
		}
	}

	@media (max-width: 950px) {
		svg {
			width: 20vh;
			margin-bottom: 0;
		}
	}

	@media (prefers-color-scheme: dark) {
		svg {
			--first-color: var(--primary-100);
			--second-color: var(--primary-500);
		}
	}

	@media (max-height: 755px) and (max-width: 950px) {
		svg {
			display: none;
		}
	}
</style>
