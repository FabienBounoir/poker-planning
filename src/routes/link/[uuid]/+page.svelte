<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { dataToShortBinary } from '$lib/utils';

	let uuid = $derived($page.params.uuid);
	let loading = $state(false);
	let resolving = $state(true);
	let roomId = $state<string | null>(null);
	let roomData = $state<any>(null);

	onMount(async () => {
		if (!uuid) {
			toast.error('UUID invalide');
			goto('/');
			return;
		}

		try {
			// Résoudre l'UUID pour obtenir le roomId
			const resolveResponse = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/room/resolve/${uuid}`
			);

			if (!resolveResponse.ok) {
				throw new Error('Impossible de résoudre le lien');
			}

			const resolveData = await resolveResponse.json();
			roomId = resolveData.roomId;

			// Vérifier si la room existe déjà (a été initialisée)
			const roomResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room?roomId=${roomId}`);

			if (roomResponse.ok) {
				roomData = await roomResponse.json();
			}
		} catch (error) {
			console.error('Error resolving UUID:', error);
			toast.error('Erreur lors de la résolution du lien');
			goto('/');
		} finally {
			resolving = false;
		}
	});

	const selectRole = async (role: 'manager' | 'player') => {
		if (!roomId) {
			toast.error('Erreur : ID de room non trouvé');
			return;
		}

		loading = true;

		try {
			if (role === 'manager') {
				// Rediriger vers la page manager
				goto(`/manager/${roomId}`);
			} else {
				// Récupérer les données de la room pour le joueur
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room?roomId=${roomId}`);

				if (res.ok) {
					const data = await res.json();
					goto(`/rooms/${dataToShortBinary(data)}`);
				} else {
					toast.error($_('JoinPage.roomDoesntExist'));
				}
			}
		} catch (error) {
			console.error('Error selecting role:', error);
			toast.error('Une erreur est survenue');
		} finally {
			loading = false;
		}
	};
</script>

<svelte:head>
	<title>Rejoindre une session - Another Planning Poker</title>
	<meta
		name="description"
		content="Rejoignez une session de poker planning en tant que manager ou joueur."
	/>
</svelte:head>

<main>
	{#if resolving}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>Résolution du lien...</p>
		</div>
	{:else}
		<h1>
			🎯 <br />Rejoindre une session
		</h1>

		{#if roomData}
			<div class="room-info">
				<p>
					<strong>Équipe :</strong>
					{roomData.team}
				</p>
				<p>
					<strong>Code de la room :</strong>
					{roomData.roomId}
				</p>
			</div>
		{/if}

		<div class="role-selection">
			<p class="instruction">Choisissez votre rôle pour cette session :</p>

			<div class="buttons">
				<button
					class="role-button manager"
					class:button--loading={loading}
					disabled={loading}
					onclick={() => selectRole('manager')}
					aria-label="Rejoindre en tant que Manager"
				>
					<span class="button__icon">👨‍💼</span>
					<span class="button__text">Manager</span>
					<span class="button__description">Créer et gérer les votes</span>
				</button>

				<button
					class="role-button player"
					class:button--loading={loading}
					disabled={loading}
					onclick={() => selectRole('player')}
					aria-label="Rejoindre en tant que Joueur"
				>
					<span class="button__icon">🎮</span>
					<span class="button__text">Joueur</span>
					<span class="button__description">Participer aux votes</span>
				</button>
			</div>
		</div>

		<div class="footer-links">
			<a href="/create" title="Créer une nouvelle session">Créer une nouvelle session</a>
			<a href="/join" title="Rejoindre avec un code">Rejoindre avec un code</a>
		</div>
	{/if}
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		text-align: center;
	}

	h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin-bottom: 2rem;
		color: var(--color-text);
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;

		.spinner {
			width: 48px;
			height: 48px;
			border: 4px solid rgba(255, 255, 255, 0.1);
			border-top-color: var(--color-primary, #ff7f00);
			border-radius: 50%;
			animation: spin 1s linear infinite;
		}

		p {
			font-size: 1.1rem;
			color: var(--color-text-secondary);
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.room-info {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		max-width: 500px;
		width: 100%;

		p {
			margin: 0.5rem 0;
			font-size: 1rem;
			color: var(--color-text);

			strong {
				color: var(--color-primary, #ff7f00);
			}
		}
	}

	.role-selection {
		width: 100%;
		max-width: 800px;

		.instruction {
			font-size: 1.2rem;
			margin-bottom: 2rem;
			color: var(--color-text);
		}

		.buttons {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
			gap: 2rem;
			margin-bottom: 2rem;
		}
	}

	.role-button {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 2rem 1.5rem;
		border: 2px solid transparent;
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.05);
		color: var(--color-text);
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		min-height: 200px;

		&:hover:not(:disabled) {
			transform: translateY(-4px);
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}

		&.manager {
			border-color: #4a90e2;

			&:hover:not(:disabled) {
				background: rgba(74, 144, 226, 0.1);
				border-color: #4a90e2;
			}
		}

		&.player {
			border-color: #50c878;

			&:hover:not(:disabled) {
				background: rgba(80, 200, 120, 0.1);
				border-color: #50c878;
			}
		}

		.button__icon {
			font-size: 3rem;
		}

		.button__text {
			font-size: 1.5rem;
			font-weight: 700;
		}

		.button__description {
			font-size: 0.9rem;
			font-weight: 400;
			color: var(--color-text-secondary);
			opacity: 0.8;
		}

		&.button--loading {
			.button__text,
			.button__description,
			.button__icon {
				opacity: 0;
			}

			&::after {
				content: '';
				position: absolute;
				width: 24px;
				height: 24px;
				border: 3px solid rgba(255, 255, 255, 0.2);
				border-top-color: white;
				border-radius: 50%;
				animation: spin 0.8s linear infinite;
			}
		}
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 2rem;

		a {
			color: var(--color-primary, #ff7f00);
			text-decoration: none;
			font-size: 1rem;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.8;
				text-decoration: underline;
			}
		}
	}

	@media (max-width: 768px) {
		.buttons {
			grid-template-columns: 1fr;
		}

		.role-button {
			min-height: 160px;
		}
	}
</style>
