<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, scale, fly } from 'svelte/transition';
	import { quintOut, elasticOut } from 'svelte/easing';
	import { _ } from 'svelte-i18n';

	export let floatingReactions: {
		id: string;
		emoji: string;
		userName: string;
		userAvatar: string;
		x: number;
		y: number;
		timestamp: number;
	}[] = [];
	export let disabled = false;

	const dispatch = createEventDispatcher<{
		react: { emoji: string };
		remove: { reactionId: string };
	}>();

	const defaultEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '🎉', '🔥'];
	let availableEmojis = [...defaultEmojis];
	let showEmojiPicker = false;
	let showCustomizer = false;
	let customEmojiInputs: string[] = Array(8).fill('');

	// Fonction pour valider qu'une chaîne contient uniquement un seul emoji
	const isValidEmoji = (str: string): boolean => {
		const trimmed = str.trim();
		// Vérifier qu'il y a exactement un emoji (pas plus)
		const emojiRegex =
			/^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]$/u;
		return emojiRegex.test(trimmed) && trimmed.length > 0;
	};

	// Charger les emoji depuis le localStorage
	const loadCustomEmojis = () => {
		try {
			const saved = localStorage.getItem('poker-reactions-emojis');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length === 8 && parsed.every(isValidEmoji)) {
					availableEmojis = parsed;
				}
			}
		} catch (error) {
			console.warn('Erreur lors du chargement des emoji:', error);
			availableEmojis = [...defaultEmojis];
		}
	};

	// Sauvegarder les emoji dans le localStorage
	const saveCustomEmojis = () => {
		try {
			localStorage.setItem('poker-reactions-emojis', JSON.stringify(availableEmojis));
		} catch (error) {
			console.warn('Erreur lors de la sauvegarde des emoji:', error);
		}
	};

	onMount(() => {
		loadCustomEmojis();
	});

	const handleReaction = (emoji: string) => {
		if (disabled) return;
		dispatch('react', { emoji });
		showEmojiPicker = false;
	};

	const toggleEmojiPicker = () => {
		if (disabled) return;

		// Si le customizer est ouvert, on ferme tout
		if (showCustomizer) {
			showCustomizer = false;
			showEmojiPicker = false;
		} else {
			// Sinon on toggle le picker normalement
			showEmojiPicker = !showEmojiPicker;
		}
	};

	const removeReaction = (reactionId: string) => {
		dispatch('remove', { reactionId });
	};

	const handleClickOutside = (event: Event) => {
		const target = event.target as HTMLElement;
		if (!target.closest('.fab-container')) {
			showEmojiPicker = false;
			showCustomizer = false;
		}
	};

	const toggleCustomizer = () => {
		showCustomizer = !showCustomizer;
		if (showCustomizer) {
			showEmojiPicker = false;
		}
	};

	const updateEmoji = (index: number) => {
		if (isValidEmoji(customEmojiInputs[index])) {
			availableEmojis[index] = customEmojiInputs[index].trim();
			saveCustomEmojis();
			customEmojiInputs[index] = '';
		}
	};

	const validateEmojiInput = (index: number) => {
		const value = customEmojiInputs[index];
		if (value === '') return;

		// Extraire seulement les emojis valides
		const emojiRegex =
			/[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]/gu;
		const matches = value.match(emojiRegex);

		if (matches && matches.length > 0) {
			// Prendre seulement le premier emoji trouvé
			customEmojiInputs[index] = matches[0];
		} else {
			// Aucun emoji trouvé, vider l'input
			customEmojiInputs[index] = '';
		}
	};

	const resetToDefault = () => {
		availableEmojis = [...defaultEmojis];
		customEmojiInputs = Array(8).fill('');
		saveCustomEmojis();
	};
</script>

<!-- Floating reactions overlay -->
{#each floatingReactions as reaction (reaction.id)}
	<div
		class="floating-reaction"
		style="left: {reaction.x}%; top: {reaction.y}%;"
		in:scale={{ duration: 1500, easing: elasticOut }}
		out:fly={{ y: -100, duration: 500, easing: quintOut }}
	>
		<button
			class="reaction-card"
			on:click={() => removeReaction(reaction.id)}
			title={$_('reactions.clickToHide')}
		>
			<img class="user-avatar" src={reaction.userAvatar} alt={reaction.userName} />
			<span class="user-name">{reaction.userName}</span>
			<div class="reaction-pin">
				<span class="reaction-emoji">{reaction.emoji}</span>
			</div>
		</button>
	</div>
{/each}

<!-- Click outside overlay -->
{#if showEmojiPicker || showCustomizer}
	<div class="click-outside-overlay" on:click={handleClickOutside}></div>
{/if}

<!-- Floating action button for emoji picker -->
<div class="fab-container">
	<button
		class="fab"
		class:fab--active={showEmojiPicker || showCustomizer}
		on:click={toggleEmojiPicker}
		{disabled}
		title={$_('reactions.react')}
	>
		{#if showEmojiPicker || showCustomizer}
			<i class="fa-solid fa-xmark fab-icon"></i>
		{:else}
			<i class="fa-solid fa-face-smile fab-icon"></i>
		{/if}
	</button>

	{#if showEmojiPicker}
		<div class="emoji-picker-fab" transition:scale={{ duration: 200, easing: quintOut }}>
			<!-- Bouton d'engrenage en premier -->
			<button
				class="emoji-option-fab settings-btn"
				on:click={toggleCustomizer}
				{disabled}
				title={$_('reactions.customize')}
			>
				<i class="fa-solid fa-gear"></i>
			</button>

			{#each availableEmojis as emoji, index}
				<button
					class="emoji-option-fab"
					on:click={() => handleReaction(emoji)}
					{disabled}
					style="--delay: {(index + 1) * 50}ms"
				>
					{emoji}
				</button>
			{/each}
		</div>
	{/if}

	{#if showCustomizer}
		<div class="emoji-customizer" transition:scale={{ duration: 200, easing: quintOut }}>
			<div class="customizer-header">
				<h3>{$_('reactions.title')}</h3>
				<button class="reset-btn" on:click={resetToDefault}>
					<i class="fa-solid fa-rotate-left"></i>
					{$_('reactions.default')}
				</button>
			</div>
			<div class="emoji-grid">
				{#each availableEmojis as emoji, index}
					<div class="emoji-edit-item">
						<span class="current-emoji">{emoji}</span>
						<div class="input-container">
							<input
								type="text"
								placeholder={$_('reactions.placeholder')}
								bind:value={customEmojiInputs[index]}
								on:input={() => validateEmojiInput(index)}
								on:keydown={(e) => e.key === 'Enter' && updateEmoji(index)}
								class="emoji-input"
								maxlength="2"
							/>
							<button
								class="update-btn"
								on:click={() => updateEmoji(index)}
								disabled={!isValidEmoji(customEmojiInputs[index])}
								title={$_('reactions.validate')}
							>
								<i class="fa-solid fa-check"></i>
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.floating-reaction {
		position: fixed;
		z-index: 1000;
		pointer-events: auto;
	}

	.click-outside-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 99;
		background: transparent;
	}

	.reaction-card {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.2em;
		background: var(--primary-50);
		border: 2px solid var(--primary-500);
		border-radius: 50px;
		padding: 0.4em 0.35em;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(10px);
		min-width: fit-content;
		height: 3.5em;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			transform: scale(1.05);
			box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
			border-color: var(--primary-600);
			background: var(--primary-100);
		}
	}

	.user-avatar {
		width: 2.7em;
		height: 2.7em;
		border-radius: 50%;
		border: 2px solid var(--primary-600);
		object-fit: cover;
		flex-shrink: 0;
	}

	.user-name {
		font-size: 0.9em;
		font-weight: 600;
		color: var(--primary-700);
		white-space: nowrap;
		max-width: 15ch;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
		padding-right: 1.5em;
		padding-left: 0.3em;
	}

	.reaction-pin {
		position: absolute;
		top: -10px;
		right: -10px;
		background: var(--primary-500);
		border: 3px solid var(--primary-100);
		border-radius: 50%;
		width: 2em;
		height: 2em;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.reaction-emoji {
		font-size: 1.2em;
	}

	.fab-container {
		position: fixed;
		bottom: 2em;
		right: 2em;
		z-index: 100;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5em;
	}

	.fab {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--primary-500);
		border: none;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;

		&:hover:not(:disabled) {
			background: var(--primary-600);
			transform: scale(1.1);
			box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
			transform: none;
		}

		&--active {
			background: var(--primary-700);
		}

		&--active .fab-icon:not(.fa-xmark) {
			transform: rotate(45deg);
		}
	}

	.fab-icon {
		font-size: 1.5em;
		transition: transform 0.3s ease;
	}

	.emoji-picker-fab {
		position: absolute;
		bottom: 70px;
		right: 0;
		display: grid;
		grid-template-rows: repeat(auto-fit, 48px);
		grid-auto-columns: 48px;
		gap: 0.3em;
		align-items: center;
		max-width: calc(100vw - 4em);
		max-height: calc(100vh - 140px);
		overflow-x: auto;
		grid-auto-flow: column;
	}

	.emoji-customizer {
		position: absolute;
		bottom: 120px;
		right: 0;
		background: var(--primary-50);
		border: 2px solid var(--primary-300);
		border-radius: 12px;
		padding: 1em;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(10px);
		max-width: 300px;
		max-height: calc(100vh - 200px);
		overflow-y: auto;
	}

	.customizer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1em;
		border-bottom: 1px solid var(--primary-200);
		padding-bottom: 0.5em;

		h3 {
			margin: 0;
			font-size: 1em;
			color: var(--primary-700);
		}
	}

	.reset-btn {
		background: var(--primary-200);
		border: 1px solid var(--primary-400);
		border-radius: 6px;
		padding: 0.3em 0.6em;
		font-size: 0.8em;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.3em;
		color: var(--primary-700);
		transition: all 0.2s ease;

		&:hover {
			background: var(--primary-300);
		}
	}

	.emoji-grid {
		display: flex;
		flex-direction: column;
		gap: 0.8em;
	}

	.emoji-edit-item {
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.5em;
		background: var(--primary-100);
		border-radius: 8px;
		border: 1px solid var(--primary-200);
	}

	.input-container {
		flex: 1;
		display: flex;
		align-items: center;
		background: var(--primary-50);
		border: 1px solid var(--primary-300);
		border-radius: 6px;
		overflow: hidden;
		transition: border-color 0.2s ease;

		&:focus-within {
			border-color: var(--primary-500);
			box-shadow: 0 0 0 2px var(--primary-500-20);
		}
	}

	.current-emoji {
		font-size: 1.5em;
		width: 2em;
		text-align: center;
		flex-shrink: 0;
	}

	.emoji-input {
		flex: 1;
		padding: 0.5em;
		border: none;
		background: transparent;
		color: var(--primary-700);
		font-size: 1em;
		outline: none;

		&::placeholder {
			color: var(--primary-400);
			font-style: italic;
		}
	}

	.update-btn {
		background: var(--primary-500);
		border: none;
		border-radius: 0;
		padding: 0.5em;
		color: white;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 2.5em;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		border-left: 1px solid var(--primary-400);

		&:hover:not(:disabled) {
			background: var(--primary-600);
		}

		&:disabled {
			background: var(--primary-300);
			cursor: not-allowed;
		}
	}

	.emoji-option-fab {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--primary-100);
		border: 2px solid var(--primary-300);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.3em;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		opacity: 0;
		transform: scale(0);
		animation: fabSlideIn 0.3s ease forwards;
		animation-delay: var(--delay);

		&:hover:not(:disabled) {
			background: var(--primary-200);
			border-color: var(--primary-500);
			transform: scale(1.1);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		&.settings-btn {
			background: var(--primary-300);
			border-color: var(--primary-500);
			color: var(--primary-700);
			font-size: 1.1em;

			&:hover:not(:disabled) {
				background: var(--primary-400);
				border-color: var(--primary-600);
			}
		}
	}

	@keyframes fabSlideIn {
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-color-scheme: dark) {
		.reaction-card {
			background: var(--primary-900);
			border-color: var(--primary-400);

			&:hover {
				background: var(--primary-800);
			}
		}

		.user-name {
			color: var(--primary-200);
		}

		.user-avatar {
			border-color: var(--primary-400);
		}

		.reaction-pin {
			background: var(--primary-600);
			border-color: var(--primary-900);
		}

		.emoji-option-fab {
			background: var(--primary-800);
			border-color: var(--primary-600);

			&:hover:not(:disabled) {
				background: var(--primary-700);
				border-color: var(--primary-400);
			}

			&.settings-btn {
				background: var(--primary-600);
				border-color: var(--primary-400);
				color: var(--primary-200);

				&:hover:not(:disabled) {
					background: var(--primary-500);
					border-color: var(--primary-300);
				}
			}
		}

		.emoji-customizer {
			background: var(--primary-900);
			border-color: var(--primary-600);

			h3 {
				color: var(--primary-200);
			}
		}

		.emoji-edit-item {
			background: var(--primary-800);
			border-color: var(--primary-600);
		}

		.input-container {
			background: var(--primary-800);
			border-color: var(--primary-600);

			&:focus-within {
				border-color: var(--primary-400);
			}
		}

		.emoji-input {
			color: var(--primary-200);

			&::placeholder {
				color: var(--primary-500);
			}
		}

		.update-btn {
			border-left-color: var(--primary-600);
		}

		.reset-btn {
			background: var(--primary-700);
			border-color: var(--primary-500);
			color: var(--primary-200);

			&:hover {
				background: var(--primary-600);
			}
		}
	}

	@media (max-width: 500px) {
		.fab-container {
			bottom: 1em;
			right: 1em;
		}

		.fab {
			width: 48px;
			height: 48px;
		}

		.fab-icon {
			font-size: 1.3em;
		}

		.emoji-picker-fab {
			bottom: 60px;
			right: 0;
			grid-template-columns: repeat(2, 1fr);
			gap: 0.2em;
			max-width: 90px;
		}

		.emoji-option-fab {
			width: 40px;
			height: 40px;
			font-size: 1.1em;
		}

		.reaction-card {
			padding: 0.3em;
			min-width: fit-content;
			height: 3em;
		}

		.user-avatar {
			width: 2.2em;
			height: 2.2em;
		}

		.user-name {
			font-size: 0.8em;
			max-width: 5ch;
			padding-right: 1.2em;
			padding-left: 0.2em;
		}

		.reaction-pin {
			width: 1.6em;
			height: 1.6em;
			top: -4px;
			right: -4px;
		}

		.reaction-emoji {
			font-size: 1em;
		}
	}

	@media (max-width: 500px) and (orientation: landscape) {
		.emoji-picker-fab {
			bottom: 60px;
			right: 0;
			max-height: calc(100vh - 100px);
			grid-template-columns: repeat(2, 1fr);
			gap: 0.2em;
			max-width: 90px;
		}

		.emoji-option-fab {
			width: 36px;
			height: 36px;
			font-size: 1em;
		}
	}
</style>
