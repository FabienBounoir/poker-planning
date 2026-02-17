<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	let {
		pokerAvatarType,
		observers,
		isObserver = $bindable(),
		roleChange = () => {},
		DEFAUT_AVATAR_URL
	} = $props();
</script>

<div class="observer-container">
	<div class="manage-state" on:click={roleChange}>
		{#if isObserver}
			<i class="fa-solid fa-right-from-bracket"></i>
			<span>{$_('RoomPage.leaveObserver')}</span>
		{:else}
			<i class="fa-solid fa-eye"></i>
			<span>{$_('RoomPage.becomeObserver')}</span>
		{/if}
	</div>

	{#if observers && observers.length > 0}
		<span class="separator"></span>

		{#each observers as observer (observer.id)}
			<div
				class="observer-display"
				transition:slide={{ axis: 'y', duration: 300, delay: 0, easing: cubicInOut }}
			>
				<img
					alt="User-avatar"
					src={observer?.avatar ||
						(pokerAvatarType || DEFAUT_AVATAR_URL) + `?seed=${observer.name}`}
				/>
				<span>{observer.name}</span>
			</div>
		{/each}
	{/if}
</div>

<style lang="scss">
	.observer-container {
		z-index: 10;
		position: fixed;
		top: 20vh;
		left: 0;

		background-color: var(--primary-200);

		max-height: calc(100dvh - 40vh);

		border-top-right-radius: 1em;
		border-bottom-right-radius: 1em;
		padding: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;

		display: flex;
		align-items: center;
		// overflow-y: auto; compliquer on voit plus le span...

		.separator {
			width: 80%;
			min-height: 0.3em;
			border-radius: 5px;
			background-color: var(--primary-500);
		}

		.manage-state {
			width: 40px;
			min-height: 40px;
			border-radius: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			background-color: var(--primary-700);
			color: var(--primary-200);
			position: relative;

			&:hover span {
				opacity: 1;
			}

			span {
				position: absolute;
				opacity: 0;
				pointer-events: none;
				font-size: 1em;
				width: max-content;
				left: 50px;
				background-color: var(--primary-900);
				color: var(--primary-200);
				padding: 0.2em 0.5em;
				border-radius: 5px;
				transition: opacity 0.2s ease-in-out;
			}
		}

		.observer-display {
			position: relative;

			img {
				min-width: 40px;
				min-height: 40px;
				max-width: 40px;
				max-height: 40px;
				border-radius: 100%;
				border: 2px solid var(--primary-700);
				object-fit: cover;
				cursor: pointer;
			}

			&:hover span {
				opacity: 1;
			}

			span {
				position: absolute;
				transform: translate(0, 25%);
				opacity: 0;
				pointer-events: none;
				font-size: 1em;
				width: max-content;
				left: 50px;
				background-color: var(--primary-900);
				color: var(--primary-200);
				padding: 0.2em 0.5em;
				border-radius: 5px;
				transition: opacity 0.2s ease-in-out;
			}
		}
	}

	@media screen and (max-width: 1100px) {
		.observer-container {
			display: none;
		}
	}

	@media (prefers-color-scheme: dark) {
		.observer-container {
			position: fixed;
			top: 20vh;
			left: 0;

			background-color: var(--primary-800);
			border-top: 3px solid var(--primary-600);
			border-right: 3px solid var(--primary-600);
			border-bottom: 3px solid var(--primary-600);

			.manage-state {
				background-color: var(--primary-200);
				color: var(--primary-700);

				span {
					background-color: var(--primary-200);
					color: var(--primary-900);
				}
			}

			.separator {
				background-color: var(--primary-300);
			}

			.observer-display {
				span {
					background-color: var(--primary-200);
					color: var(--primary-900);
				}

				img {
					border-color: var(--primary-100);
				}
			}
		}
	}
</style>
