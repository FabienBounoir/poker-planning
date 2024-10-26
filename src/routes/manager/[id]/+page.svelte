<script>
	import { page } from '$app/stores';
	import Code from '$lib/components/Code.svelte';
	import TextArea from '$lib/components/Textarea.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { backOut } from 'svelte/easing';
	import { fade, fly, scale } from 'svelte/transition';

	let roomId = $page.params.id;
	let ws;

	let userStory = $state('NFS-1345 - Faire un planning poker');

	let timeout = null;

	let pokerManager = $state({
		team: 'NFS',
		cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
		state: 'waiting',
		userStory: 'Faire un planning poker'
	});

	let users = $state([]);

	let selectedLetter = $state(null);

	const canStarVote = () => {
		if (pokerManager.userStory == '') {
			return toast.error('No User Story Write');
		}

		if (users?.length < 1) {
			return toast.error('No User Found');
		}

		changeState('playing');
	};

	const connect = () => {
		try {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			ws = new WebSocket(
				`${protocol}//${window.location.host}/websocket?${new URLSearchParams({
					roomId,
					username: 'ADMIN',
					manager: true
				})}`
			);

			ws.onmessage = (e) => {
				console.log(e);
				const payload = JSON.parse(e.data);

				switch (payload.type) {
					case 'players':
						{
							users = payload.data;
						}
						break;
					case 'state': {
						pokerManager.state = payload.data.state;
					}
					case 'game-update': {
						pokerManager = payload.data;
					}
				}
			};
		} catch (e) {
			console.error('Websocket error', e);
		} finally {
			submitting = false;
		}
	};

	onMount(() => {
		connect();
	});

	const changeState = (state) => {
		ws.send(JSON.stringify({ type: 'state', data: { state, userStory: pokerManager.userStory } }));
	};
</script>

<svelte:head><title>Poker Planning: {pokerManager.team}</title></svelte:head>

<main>
	<div class="manager">
		<div class="container">
			<h1>
				<span in:fly|local={{ easing: backOut, x: -25 }}> Poker Planning </span>
			</h1>

			<div class="me">Bienvenue NFS!</div>

			<Code
				code={'123-534'}
				url={`${window.location.protocol}//${window.location.host}/rooms/${roomId}`}
			/>
		</div>

		<label>Define here your user story:</label>
		<TextArea
			bind:value={pokerManager.userStory}
			disabled={pokerManager.state == 'result' || pokerManager.state == 'waiting'}
			minRows={1}
			maxRows={10}
		/>

		<div class="buttons">
			{#if pokerManager.state == 'playing'}
				<button
					on:click={() => {
						changeState('result');
					}}>Finish Voting</button
				>
			{:else if pokerManager.state == 'result' || pokerManager.state == 'waiting'}
				<button on:click={canStarVote}>Star Voting</button>
			{/if}
		</div>
	</div>

	<div class="information">
		{#each users as user}
			<div class="user">
				<div class="profile">
					<img src="https://api.dicebear.com/9.x/dylan/svg?seed={user.name}" />
					<h2>{user.name}</h2>
				</div>
				{#if pokerManager.state === 'playing'}
					<p class="skeleton" class:selectedLetter={user.selectedCard != null}></p>
				{:else if pokerManager.state === 'result'}
					<p>{user.selectedCard}</p>
				{:else}
					<h3 class="no-vote">-</h3>
				{/if}
			</div>
		{/each}

		{#if users?.length < 1}
			<div>
				<p>No participants for the poker planning.</p>
			</div>
		{/if}
	</div>
</main>

<style lang="scss">
	main {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 0 1em;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100dvh;
		gap: 5dvh;

		.manager {
			padding: 5vw;
			max-height: 100dvh;

			.container {
				padding: 3rem 3rem 3rem 0;
				display: flex;
				flex-direction: column;
				min-height: 100%;
				color: var(--primary-950);

				> h1 {
					font-size: 3rem;
					font-weight: 900;
					line-height: 37px;

					span {
						display: block;
						width: max-content;
					}
				}

				& > .me {
					font-weight: 100;
					font-size: 1.5rem;

					margin-bottom: 3rem;
					opacity: 0.75;
				}
			}

			.buttons {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				gap: 1em;
				margin-top: 2em;

				button {
					width: 100%;
				}
			}
		}

		.information {
			max-height: 100dvh;
			padding: 0 3em;
			overflow-y: auto;
			gap: 1em;
			display: flex;
			flex-direction: column;

			.user {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				height: 3em;
				padding: 0 1em;
				border-radius: 5px;
				background-color: var(--primary-200);

				.profile {
					display: flex;
					gap: 0.5em;
					align-items: center;

					img {
						border-radius: 100%;
						border: 2px solid var(--primary-700);
						width: 30px;
						height: 30px;
					}
				}

				.no-vote {
					font-size: 2em;
					color: var(--primary-800);
				}

				.skeleton {
					width: 1.5em;
					aspect-ratio: 1;
					background-color: red;
					border-radius: 999999px;
					transition: background-color 0.3s;

					&.selectedLetter {
						background-color: green;
					}
				}

				p:not(.skeleton) {
					font-weight: 700;
					color: var(--primary-950);
					font-size: 1.5em;
				}
			}
		}
	}

	@media screen and (max-width: 950px) {
		main {
			grid-template-columns: 1fr;
			padding: 1em;
			height: auto;

			.information {
				max-height: none;
				padding: 0;
			}

			.manager {
				max-height: none;
				padding: 0;

				.container {
					padding: 1rem 1rem 2rem 0;
				}
			}
		}
	}
</style>
