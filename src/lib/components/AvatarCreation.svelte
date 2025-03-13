<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { toast } from 'svelte-sonner';
	let {
		customAvatarUrl = $bindable(),
		avatarType = 'dylan',
		username,
		loading = $bindable(true)
	} = $props();

	let isCustomAvatarEnabled = $state(
		import.meta.env.VITE_CUSTOM_AVATAR_ENABLED
			? import.meta.env.VITE_CUSTOM_AVATAR_ENABLED === 'true'
			: true
	);

	onMount(() => {
		if (!customAvatarUrl || !isCustomAvatarEnabled) return;

		fetch(customAvatarUrl)
			.then((response) => {
				if (!response?.ok || response?.url?.includes?.('removed')) {
					customAvatarUrl = '';
				}
			})
			.catch(() => {
				customAvatarUrl = '';
			});
	});

	// Fonction pour gérer la sélection de fichier
	const handleFileSelect = async (event: Event) => {
		if (!event.target || !event.target.files) {
			return;
		}

		let selectedFile = event.target.files[0];

		if (selectedFile.size > 2 * 1024 * 1024) {
			toast.error($_('RoomPage.fileTooLarge'));
			return;
		}

		loading = true;

		try {
			const base64 = await convertToBase64(selectedFile);

			const formData = new FormData();
			formData.append('file', selectedFile);

			const response = await fetch('/_api/upload', {
				method: 'POST',
				body: base64
			}).then((res) => res.json());

			if (!response.url) {
				throw new Error('No URL returned');
			}

			customAvatarUrl = response.url;
			window.localStorage.setItem('avatar', response.url);
		} catch (error) {
			disableCustomAvatar();
		} finally {
			loading = false;
		}
	};

	const convertToBase64 = (file: File) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64Data = reader.result.split(',')[1];
				resolve(base64Data);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	const formatName = (name: string) => {
		return name
			.trim()
			.split(/[\s.]+/)
			.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
			.join(' ');
	};

	const disableCustomAvatar = () => {
		isCustomAvatarEnabled = false;

		toast.error($_('RoomPage.errorUploadingFile'));

		customAvatarUrl = '';
		window.localStorage.removeItem('avatar');
	};
</script>

<div class="avatar-creation">
	<img
		src={customAvatarUrl ||
			`https://api.dicebear.com/9.x/${avatarType || 'dylan'}/svg?seed=${formatName(username)}`}
		alt="User-avatar"
		class:loading
		on:loadstart={() => (loading = true)}
		on:load={() => (loading = false)}
		on:error={(customAvatarUrl = '')}
	/>
	<div class="edit" style={isCustomAvatarEnabled ? '' : 'display: none'}>
		<svg
			width="30"
			height="30"
			viewBox="0 0 800 800"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clip-path="url(#clip0_102_2)">
				<circle cx="400" cy="400" r="400" fill="var(--primary-500)" />
				{#if !customAvatarUrl}
					<path
						d="M586.798 213.091C535.068 161.635 484.404 160.309 431.34 213.091L399.075 245.185C396.409 247.837 395.342 252.081 396.409 255.794C416.674 326.082 473.204 382.312 543.867 402.47C544.934 402.735 546 403 547.067 403C550 403 552.667 401.939 554.8 399.817L586.798 367.724C613.197 341.731 625.996 316.533 625.996 291.071C626.263 264.812 613.463 239.349 586.798 213.091Z"
						fill="var(--primary-950)"
					/>
					<path
						d="M496.289 427.119C488.551 423.391 481.08 419.664 473.876 415.404C468.006 411.943 462.402 408.216 456.799 404.222C452.263 401.293 446.927 397.034 441.857 392.774C441.323 392.507 439.455 390.91 437.321 388.78C428.516 381.325 418.643 371.74 409.838 361.091C409.037 360.558 407.703 358.694 405.836 356.298C403.167 353.103 398.631 347.779 394.629 341.655C391.427 337.661 387.691 331.804 384.223 325.947C379.954 318.758 376.218 311.57 372.482 304.115C371.917 302.907 371.37 301.704 370.841 300.509C366.903 291.634 355.304 289.04 348.428 295.903L195.578 448.418C192.109 451.879 188.908 458.535 188.107 463.061L173.698 565.031C171.03 583.135 176.1 600.175 187.307 611.623C196.912 620.941 210.253 626 224.662 626C227.864 626 231.066 625.734 234.268 625.201L336.728 610.824C341.531 610.026 348.201 606.831 351.403 603.37L504.062 451.046C510.989 444.134 508.376 432.276 499.368 428.439C498.354 428.008 497.327 427.566 496.289 427.119Z"
						fill="var(--primary-950)"
					/>
				{:else}
					<path
						d="M597.02 510.993L483.817 397.842L593.116 288.593C615.757 265.962 615.757 228.505 593.116 205.874C570.475 183.244 533.001 183.244 510.361 205.874L401.061 315.125L287.859 201.973C265.218 179.342 227.744 179.342 205.103 201.973C182.463 224.603 182.463 262.061 205.103 284.691L318.306 397.842L201.98 514.115C179.34 536.745 179.34 574.202 201.98 596.832C213.691 608.538 228.525 614 243.358 614C258.192 614 273.025 608.538 284.736 596.832L401.061 480.56L514.264 593.711C525.975 605.416 540.808 610.879 555.642 610.879C570.475 610.879 585.309 605.416 597.02 593.711C619.66 571.081 619.66 534.404 597.02 510.993Z"
						fill="var(--primary-950)"
					/>
				{/if}
			</g>
			<defs>
				<clipPath id="clip0_102_2">
					<rect width="800" height="800" fill="white" />
				</clipPath>
			</defs>
		</svg>

		<label
			for="file-upload"
			on:click={(e) => {
				if (customAvatarUrl) {
					e.preventDefault();
					customAvatarUrl = '';
					window.localStorage.removeItem('avatar');
				}
			}}
		></label>
		<input
			disabled={customAvatarUrl}
			id="file-upload"
			type="file"
			accept="image/png, image/jpeg"
			on:change={handleFileSelect}
		/>
	</div>
</div>

<style lang="scss">
	.avatar-creation {
		border-radius: 100%;
		border: 2px solid var(--primary-700);
		width: 80px;
		height: 80px;
		margin-bottom: 1em;
		justify-self: center;
		position: relative;

		.edit {
			position: absolute;
			border-radius: 100%;
			aspect-ratio: 1;
			right: -7px;
			top: -7px;
			width: 30px;
			height: 30px;
			cursor: pointer;
			z-index: 10;
			overflow: hidden;

			svg {
				pointer-events: none;
				cursor: pointer;
			}

			label {
				cursor: pointer;
				position: absolute;
				width: 30px;
				height: 30px;
				top: 0;
				left: 0;
			}

			input[type='file'] {
				display: none;
			}
		}

		img {
			width: 100%;
			height: 100%;
			border-radius: 100%;
			object-fit: cover;

			&.loading {
				filter: blur(4px);
				animation: spinLoading 1.5s infinite;
			}
		}
	}

	//breatgin and spinning animation
	@keyframes spinLoading {
		0% {
			transform: rotate(0deg) scale(1);
			filter: blur(3px) brightness(1);
		}

		40% {
			transform: rotate(180deg) scale(1.1);
			filter: blur(3px) brightness(1.1);
		}

		80% {
			transform: rotate(380deg) scale(1);
			filter: blur(3px) brightness(1);
		}

		90% {
			transform: rotate(350deg) scale(1.05);
			filter: blur(3px) brightness(1.1);
		}

		100% {
			transform: rotate(360deg) scale(1);
			filter: blur(3px) brightness(1);
		}
	}
</style>
