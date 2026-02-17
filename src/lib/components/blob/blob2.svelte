<script>
	import { onMount } from 'svelte';
	import { fade, scale, fly } from 'svelte/transition';

	let theme = $state('');
	let clickCount = $state(0);
	let multiplier = $state(1);
	let displayCookieClick = $state(false);
	let floatingNumbers = $state([]);
	let autoClickerIntervals = $state([]);
	let purchaseAnimations = $state([]);
	let nextId = 0;

	// Paliers pour le multiplicateur
	const multiplierLevels = [2, 3, 5, 10, 20, 50, 100];
	
	let powerUps = [
		{ 
			name: 'Multiplicateur', 
			effect: upgradeMultiplier, 
			price: 50, 
			purchased: 0, 
			icon: '✖️',
			priceMultiplier: 2.5 // Prix augmente plus vite
		},
		{ 
			name: 'Auto Clicker', 
			effect: addAutoClicker, 
			price: 100, 
			purchased: 0, 
			icon: '⚡',
			priceMultiplier: 1.3 // Prix augmente modérément
		},
		{ 
			name: 'Réduction de prix', 
			effect: reducePrices, 
			price: 300, 
			purchased: 0, 
			icon: '💰',
			priceMultiplier: 3 // Prix augmente beaucoup (rare)
		},
		{ 
			name: 'Boost temporaire', 
			effect: temporaryBoost, 
			price: 200, 
			purchased: 0, 
			icon: '🚀',
			priceMultiplier: 1.8 // Prix augmente normalement
		}
	];

	onMount(() => {
		const today = new Date();
		if (
			(today.getMonth() === 9 && today.getDate() >= 15) ||
			(today.getMonth() === 10 && today.getDate() <= 1)
		) {
			theme = 'halloween';
		}

		// Charger la progression depuis le localStorage
		loadProgress();
	});

	// Sauvegarder la progression à chaque changement
	$effect(() => {
		if (clickCount > 0 || multiplier > 1 || powerUps.some(p => p.purchased > 0)) {
			saveProgress();
		}
	});

	function saveProgress() {
		const progress = {
			clickCount,
			multiplier,
			powerUps: powerUps.map(p => ({
				purchased: p.purchased,
				price: p.price
			})),
			timestamp: Date.now()
		};
		localStorage.setItem('blobClickerProgress', JSON.stringify(progress));
	}

	function loadProgress() {
		try {
			const saved = localStorage.getItem('blobClickerProgress');
			if (saved) {
				const progress = JSON.parse(saved);
				
				// Restaurer les valeurs
				clickCount = progress.clickCount || 0;
				multiplier = progress.multiplier || 1;
				
				// Restaurer les power-ups
				if (progress.powerUps) {
					progress.powerUps.forEach((savedPowerUp, index) => {
						if (powerUps[index]) {
							powerUps[index].purchased = savedPowerUp.purchased || 0;
							powerUps[index].price = savedPowerUp.price || powerUps[index].price;
						}
					});
				}

				// Recréer les auto-clickers
				const autoClickerCount = powerUps[1].purchased;
				for (let i = 1; i <= autoClickerCount; i++) {
					const interval = setInterval(() => {
						clickCount += i;
						createFloatingNumber(i);
					}, 1000);
					autoClickerIntervals = [...autoClickerIntervals, interval];
				}
			}
		} catch (error) {
			console.error('Erreur lors du chargement de la progression:', error);
		}
	}

	function resetProgress() {
		localStorage.removeItem('blobClickerProgress');
		clickCount = 0;
		multiplier = 1;
		powerUps.forEach(p => {
			p.purchased = 0;
		});
		powerUps[0].price = 50;
		powerUps[1].price = 100;
		powerUps[2].price = 300;
		powerUps[3].price = 200;
		autoClickerIntervals.forEach(interval => clearInterval(interval));
		autoClickerIntervals = [];
	}

	function createFloatingNumber(value, x = null, y = null) {
		// Si x et y ne sont pas fournis, générer des positions aléatoires
		if (x === null || y === null) {
			// Position aléatoire autour du centre du SVG (approximativement)
			x = 64 + (Math.random() - 0.5) * 100; // Centre SVG ± 50px
			y = 85 + (Math.random() - 0.5) * 80;  // Centre SVG ± 40px
		}
		
		const id = nextId++;
		floatingNumbers = [...floatingNumbers, { id, value, x, y }];
		
		setTimeout(() => {
			floatingNumbers = floatingNumbers.filter(num => num.id !== id);
		}, 1000);
	}

	function createPurchaseAnimation(index) {
		const id = Date.now();
		purchaseAnimations = [...purchaseAnimations, { id, index }];
		
		setTimeout(() => {
			purchaseAnimations = purchaseAnimations.filter(anim => anim.id !== id);
		}, 500);
	}

	function handleClick(event) {
		clickCount += multiplier;
		
		// Activer l'affichage du menu au premier clic
		if (!displayCookieClick) {
			displayCookieClick = true;
		}
		
		// Créer l'animation +X à l'endroit du clic
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		createFloatingNumber(multiplier, x, y);
	}

	function buyPowerUp(index) {
		const powerUp = powerUps[index];
		if (clickCount >= powerUp.price) {
			clickCount -= powerUp.price;
			powerUp.purchased++;
			powerUp.effect(index);
			powerUp.price = Math.floor(powerUp.price * powerUp.priceMultiplier);
			
			// Animation d'achat
			createPurchaseAnimation(index);
		}
	}

	function upgradeMultiplier() {
		const currentLevel = powerUps[0].purchased;
		if (currentLevel < multiplierLevels.length) {
			multiplier = multiplierLevels[currentLevel];
		} else {
			// Au-delà des paliers, continuer à doubler
			multiplier *= 2;
		}
	}

	function addAutoClicker() {
		const autoClickerLevel = powerUps[1].purchased; // Le niveau actuel (après l'incrémentation)
		
		const interval = setInterval(() => {
			clickCount += autoClickerLevel;
			createFloatingNumber(autoClickerLevel);
		}, 1000);
		
		autoClickerIntervals = [...autoClickerIntervals, interval];
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

	function getMultiplierName(purchased) {
		if (purchased === 0) return 'x2';
		if (purchased < multiplierLevels.length) {
			return `x${multiplierLevels[purchased]}`;
		}
		return `x${multiplier * 2}`;
	}

	function getProgressPercentage(powerUp) {
		return Math.min((clickCount / powerUp.price) * 100, 100);
	}
</script>

{#if theme === 'halloween'}
	<div class="svg-container">
		<svg
			class="halloween"
			width="12vw"
			viewBox="0 0 128 170"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			on:click={handleClick}
		>
			<path
				d="M68.3537 0.897253C67.6531 1.53111 66.8191 2.06489 66.4855 2.06489C64.7507 2.06489 64.2837 3.26589 65.6848 4.19999C66.1185 4.50024 66.6857 5.33427 66.8858 6.06821C67.4863 8.06987 67.9868 8.3034 69.0543 7.06904C69.6214 6.43518 70.5556 5.90141 71.4229 5.66788C73.091 5.26755 73.3245 4.46688 72.0234 3.5995C71.5897 3.29925 71.0226 2.46522 70.8224 1.73128C70.1886 -0.337104 69.7882 -0.470548 68.3537 0.897253Z"
				fill="var(--halloween-stars)"
			/>
			<path
				d="M84.2002 5.9681C83.3328 8.37009 82.7323 9.3042 81.498 10.1382C79.5964 11.4727 79.7632 12.24 82.0651 12.9739C83.5663 13.441 84.1668 13.8413 85.0009 14.9756C85.568 15.7429 86.2352 16.4435 86.4688 16.5435C87.0359 16.8104 87.8699 16.4101 87.8699 15.9097C87.8699 14.642 89.2044 12.5069 90.5054 11.6395C92.4404 10.3718 92.3069 9.43764 90.0717 8.77042C88.8707 8.40345 88.1034 7.86968 87.1026 6.66868C85.568 4.83382 84.6673 4.63366 84.2002 5.9681Z"
				fill="var(--halloween-stars)"
			/>

			<path
				d="M91.5452 140C91.5452 135.2 88.8785 132 87.5452 131L97.0452 129.5L99.5452 134.5C101.545 138.5 99.3785 147.5 98.0452 151.5C101.645 155.1 103.169 157.747 103.545 158.5C104.045 159.5 103.745 161.5 102.545 163.5C101.345 165.5 98.5452 164.5 97.5452 163.5C96.2118 161.667 92.9452 157.5 90.5452 155.5C88.1452 153.5 88.8785 151 89.5452 150C90.2118 148.667 91.5452 144.8 91.5452 140Z"
				fill="var(--halloween-body)"
			/>
			<path
				d="M70.0452 143.5C70.0452 142.5 65.8785 137.667 63.5452 137L69.0452 130.5C77.0452 134 78.1174 142.075 78.5452 144C79.3452 147.6 76.8785 155.833 75.5452 159.5C79.1452 161.1 80.3785 162.833 80.5452 163.5C82.1452 170.3 77.5452 170.333 75.0452 169.5L67.5452 165C65.0452 163 66.2118 159.833 66.5452 158.5C70.5452 148.5 70.0452 144.5 70.0452 143.5Z"
				fill="var(--halloween-body)"
			/>

			<path
				d="M120.545 90.5L110.545 101L111.545 110.5C115.712 108.833 123.045 101.5 126.545 95.5C130.545 88.6429 122.045 88 120.545 90.5Z"
				fill="var(--halloween-body)"
			/>
			<path
				d="M6.54517 112.5C11.1597 115.269 20.7118 117.833 25.5452 118L27.5452 126.5C20.3452 126.9 8.54518 122.406 4.04517 121C-3.95482 118.5 1.54518 109.5 6.54517 112.5Z"
				fill="var(--halloween-body)"
			/>

			<path
				d="M65.8516 21.4476C58.7791 22.1148 51.6398 27.0523 48.3371 33.591C47.8367 34.5919 47.3029 35.4259 47.1361 35.4259C46.9693 35.4259 46.202 34.9922 45.4681 34.4251C43.3663 32.9238 39.2295 31.4893 35.76 31.0222C21.1145 29.1874 8.37061 42.9321 11.273 57.4442C11.64 59.1789 12.4073 61.4475 13.3414 63.3491C14.1421 65.0505 14.8093 66.485 14.8093 66.5517C14.8093 66.6184 13.6416 67.3857 12.2071 68.2198C5.73509 72.0563 1.56496 78.3615 0.430684 86.1346C-0.536786 92.7401 1.93193 100.747 6.50239 105.918C10.7059 110.688 18.0119 114.158 23.9168 114.158H25.6516L25.685 117.928C25.7183 122.498 26.2855 124.833 28.3872 129.137C29.6883 131.773 30.4556 132.84 32.8242 135.209C36.7608 139.212 40.6974 141.147 46.3354 141.848C52.0735 142.548 58.3788 140.813 63.3496 137.077C65.9851 135.109 68.8208 131.639 70.9559 127.769L72.2236 125.501L73.558 126.335C79.7298 130.271 85.6347 131.672 91.9066 130.705C97.3111 129.904 101.448 127.903 104.817 124.433C108.62 120.496 110.289 117.194 111.423 111.456C111.89 108.92 111.923 107.986 111.623 105.551C111.089 101.214 109.188 96.0762 107.186 93.5074C106.252 92.3064 106.419 91.6726 107.887 90.8385C109.555 89.9044 113.391 86.1346 114.759 84.0996C118.495 78.5283 119.796 71.3891 118.195 64.8503C116.994 59.7794 115.026 56.2432 111.623 52.8737C106.786 48.1031 101.281 45.7678 94.5421 45.5676L91.0392 45.4342L90.839 42.365C90.6055 38.8287 90.0384 36.727 88.3703 33.2574C84.6005 25.3842 75.3595 20.5469 65.8516 21.4476Z"
				fill="var(--halloween-body)"
			/>

			<path d="M40 70L47 77L54 70L40 70Z" fill="var(--halloween-eyes)" />
			<path d="M75 70L82 77L89 70L75 70Z" fill="var(--halloween-eyes)" />

			<path
				d="M42 88L47 93L52 88L57 93L62 88L67 93L72 88L77 93L82 88L87 93"
				stroke="var(--halloween-eyes)"
				stroke-width="2.5"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		
		{#each floatingNumbers as num (num.id)}
			<div 
				class="floating-number" 
				style="left: {num.x}px; top: {num.y}px;"
				in:fly={{ y: -50, duration: 1000 }}
				out:fade
			>
				+{num.value}
			</div>
		{/each}
	</div>
{:else}
	<div class="svg-container">
		<svg
			width="12vw"
			viewBox="0 0 128 170"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			on:click={handleClick}
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
		
		{#each floatingNumbers as num (num.id)}
			<div 
				class="floating-number" 
				style="left: {num.x}px; top: {num.y}px;"
				in:fly={{ y: -50, duration: 1000 }}
				out:fade
			>
				+{num.value}
			</div>
		{/each}
	</div>
{/if}

{#if displayCookieClick}
	<div class="click-count" in:scale={{ duration: 300 }}>
		<span class="count-label">Clics</span>
		<span class="count-value">{clickCount}</span>
	</div>

	<div class="floating-menu" in:fade={{ duration: 500 }}>
		<div class="menu-header">
			<h3>Power-ups</h3>
		</div>
		
		<div class="power-ups-list">
			{#each powerUps as powerUp, index}
				<div 
					class="power-up-card"
					class:purchased={purchaseAnimations.some(anim => anim.index === index)}
				>
					<div class="power-up-header">
						<span class="power-up-icon">{powerUp.icon}</span>
						<div class="power-up-info">
							<span class="power-up-name">
								{#if index === 0}
									{powerUp.name} {getMultiplierName(powerUp.purchased)}
								{:else if index === 1 && powerUp.purchased > 0}
									{powerUp.name} +{powerUp.purchased}/s
								{:else}
									{powerUp.name}
								{/if}
							</span>
							{#if powerUp.purchased > 0}
								<span class="purchase-badge">{powerUp.purchased}</span>
							{/if}
						</div>
					</div>
					
					<!-- Barre de progression -->
					<div class="progress-bar">
						<div 
							class="progress-fill" 
							style="width: {getProgressPercentage(powerUp)}%"
						></div>
					</div>
					
					<button 
						class="buy-button" 
						class:disabled={clickCount < powerUp.price}
						on:click={() => buyPowerUp(index)} 
						disabled={clickCount < powerUp.price}
					>
						{#if clickCount < powerUp.price}
							<span class="button-text">{clickCount}/{powerUp.price}</span>
						{:else}
							<span class="button-text">Acheter • {powerUp.price}</span>
						{/if}
					</button>
				</div>
			{/each}
		</div>

		<!-- Bouton de reset -->
		<div class="menu-footer">
			<button class="reset-button" on:click={resetProgress}>
				🔄 Réinitialiser
			</button>
		</div>
	</div>
{/if}

<style lang="scss">
	.svg-container {
		position: absolute;
		top: 50%;
		left: 10%;
	}

	.floating-number {
		position: absolute;
		font-size: 1.5em;
		font-weight: bold;
		color: var(--primary-600);
		pointer-events: none;
		user-select: none;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.floating-menu {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		background: var(--primary-50);
		border: 2px solid var(--primary-200);
		border-radius: 1rem;
		box-shadow: 
			0 4px 6px rgba(0, 0, 0, 0.05),
			0 10px 20px rgba(0, 0, 0, 0.08);
		width: 280px;
		z-index: 1000;
		overflow: hidden;

		.menu-header {
			background: var(--primary-500);
			padding: 1rem 1.25rem;
			
			h3 {
				margin: 0;
				font-size: 1.125rem;
				font-weight: 700;
				color: white;
				letter-spacing: 0.02em;
			}
		}

		.power-ups-list {
			padding: 1rem;
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
		}

		.power-up-card {
			background: white;
			border: 2px solid var(--primary-100);
			border-radius: 0.75rem;
			padding: 0.875rem;
			transition: all 0.2s ease;

			&:hover {
				border-color: var(--primary-300);
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
			}

			&.purchased {
				animation: purchaseShake 0.5s ease;
				border-color: var(--primary-500);
			}

			@keyframes purchaseShake {
				0%, 100% { transform: scale(1) rotate(0deg); }
				25% { transform: scale(1.05) rotate(2deg); }
				50% { transform: scale(1.05) rotate(-2deg); }
				75% { transform: scale(1.05) rotate(2deg); }
			}
		}

		.power-up-header {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			margin-bottom: 0.5rem;
		}

		.power-up-icon {
			font-size: 1.5rem;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 2.5rem;
			height: 2.5rem;
			background: var(--primary-100);
			border-radius: 0.5rem;
			flex-shrink: 0;
		}

		.power-up-info {
			flex: 1;
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		.power-up-name {
			font-size: 0.875rem;
			font-weight: 600;
			color: var(--primary-900);
			flex: 1;
		}

		.purchase-badge {
			background: var(--primary-600);
			color: white;
			font-size: 0.75rem;
			font-weight: 700;
			padding: 0.25rem 0.5rem;
			border-radius: 999px;
			min-width: 1.5rem;
			text-align: center;
		}

		.progress-bar {
			width: 100%;
			height: 6px;
			background: var(--primary-100);
			border-radius: 999px;
			overflow: hidden;
			margin-bottom: 0.75rem;
		}

		.progress-fill {
			height: 100%;
			background: linear-gradient(90deg, var(--primary-400), var(--primary-600));
			border-radius: 999px;
			transition: width 0.3s ease;
		}

		.buy-button {
			width: 100%;
			background: var(--primary-500);
			color: white;
			border: none;
			padding: 0.625rem 1rem;
			border-radius: 0.5rem;
			font-weight: 600;
			font-size: 0.875rem;
			cursor: pointer;
			transition: all 0.2s ease;
			display: flex;
			align-items: center;
			justify-content: center;

			&:hover:not(:disabled) {
				background: var(--primary-600);
				transform: translateY(-1px);
				box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
			}

			&:active:not(:disabled) {
				transform: translateY(0);
			}

			&.disabled,
			&:disabled {
				background: var(--primary-200);
				color: var(--primary-500);
				cursor: not-allowed;
				transform: none;
			}

			.button-text {
				letter-spacing: 0.02em;
			}
		}

		.menu-footer {
			padding: 1rem;
			border-top: 2px solid var(--primary-100);
		}

		.reset-button {
			width: 100%;
			background: transparent;
			color: var(--primary-700);
			border: 2px solid var(--primary-300);
			padding: 0.5rem 1rem;
			border-radius: 0.5rem;
			font-weight: 600;
			font-size: 0.8rem;
			cursor: pointer;
			transition: all 0.2s ease;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.25rem;

			&:hover {
				background: var(--primary-100);
				border-color: var(--primary-400);
			}

			&:active {
				transform: scale(0.98);
			}
		}
	}

	.click-count {
		position: fixed;
		top: 2rem;
		right: 2rem;
		padding: 0.875rem 1.5rem;
		background: var(--primary-500);
		border-radius: 999px;
		box-shadow: 
			0 4px 6px rgba(0, 0, 0, 0.05),
			0 10px 20px rgba(0, 0, 0, 0.08);
		user-select: none;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border: 2px solid var(--primary-400);

		.count-label {
			font-size: 0.875rem;
			font-weight: 600;
			color: white;
			opacity: 0.9;
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		.count-value {
			font-size: 1.5rem;
			font-weight: 700;
			color: white;
			animation: pulse 2s ease-in-out infinite;
		}

		@keyframes pulse {
			0%, 100% {
				transform: scale(1);
			}
			50% {
				transform: scale(1.05);
			}
		}
	}

	svg {
		animation: float 5s ease-in-out infinite;
		transform-origin: center;
		transition: scale 0.3s, filter 0.3s ease-in-out !important;
		cursor: pointer;

		--first-color: var(--primary-950);
		--second-color: var(--primary-500);

		/* Variables pour Halloween */
		--halloween-body: #ff8c00;
		--halloween-eyes: #000000;
		--halloween-stars: #9400d3;

		&:active {
			scale: 1.1;
		}

		&:hover {
			filter: drop-shadow(0 0 15px var(--primary-900));
		}
	}

	/* Animation Halloween uniquement */
	svg.halloween {
		animation:
			float 5s ease-in-out infinite,
			spookyGlow 3s ease-in-out infinite;
		filter: drop-shadow(0 0 10px rgba(255, 140, 0, 0.5));

		&:active {
			filter: drop-shadow(0 0 20px rgba(255, 140, 0, 0.8));
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

	@keyframes spookyGlow {
		0%,
		100% {
			filter: drop-shadow(0 0 10px rgba(255, 140, 0, 0.5));
		}
		50% {
			filter: drop-shadow(0 0 20px rgba(148, 0, 211, 0.7));
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
		.svg-container {
			position: initial;
			transform: translateY(0);
			display: flex;
			justify-content: center;
			margin-bottom: 5em;
			
			svg {
				width: 15vw;
				animation: floatMobile 5s ease-in-out infinite;
			}
		}

		.floating-menu {
			bottom: 1rem;
			right: 1rem;
			width: calc(100% - 2rem);
			max-width: 320px;
		}

		.click-count {
			top: 1rem;
			right: 1rem;
		}
	}

	@media (max-width: 950px) {
		.svg-container svg {
			width: 20vh;
		}
	}

	@media (prefers-color-scheme: dark) {
		.floating-menu {
			background: var(--primary-950);
			border-color: var(--primary-900);

			.menu-header {
				background: var(--primary-700);
			}

			.power-up-card {
				background: var(--primary-900);
				border-color: var(--primary-800);

				&:hover {
					border-color: var(--primary-600);
				}

				&.purchased {
					border-color: var(--primary-400);
				}
			}

			.power-up-icon {
				background: var(--primary-800);
			}

			.power-up-name {
				color: var(--primary-50);
			}

			.progress-bar {
				background: var(--primary-800);
			}

			.buy-button {
				&.disabled,
				&:disabled {
					background: var(--primary-800);
					color: var(--primary-400);
				}
			}

			.menu-footer {
				border-top-color: var(--primary-800);
			}

			.reset-button {
				color: var(--primary-300);
				border-color: var(--primary-700);

				&:hover {
					background: var(--primary-800);
					border-color: var(--primary-600);
				}
			}
		}

		.click-count {
			background: var(--primary-700);
			border-color: var(--primary-600);
		}

		.floating-number {
			color: var(--primary-400);
		}

		svg {
			--first-color: var(--primary-50);
			--second-color: var(--primary-500);

			/* Halloween en mode sombre */
			--halloween-body: #ff9500;
			--halloween-eyes: #1a1a1a;
			--halloween-stars: #a020f0;
		}

		svg.halloween {
			filter: drop-shadow(0 0 15px rgba(255, 149, 0, 0.6));
		}
	}

	@media (max-height: 755px) and (max-width: 950px) {
		.svg-container {
			display: none;
		}
	}
</style>
