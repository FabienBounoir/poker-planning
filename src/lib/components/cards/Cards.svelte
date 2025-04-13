<script>
	import { fade } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { quintOut } from 'svelte/easing';
	import Card from './Card.svelte';

	let {
		cards,
		isObserver,
		selectedLetter = $bindable(),
		submittedLetter = $bindable(),
		sendVote = () => {}
	} = $props();
</script>

{#if isObserver}
	<h1>{$_('RoomPage.voteInProgress')}</h1>
{:else}
	<div class="flex" in:fade={{ duration: 500, easing: quintOut }}>
		{#each cards as card}
			<Card
				content={card}
				bind:cardSelected={selectedLetter}
				bind:submittedLetter
				clickHandler={() => {
					sendVote();
				}}
			/>
		{/each}
	</div>
{/if}

<style lang="scss">
	.flex {
		display: flex;
		gap: 2vw;
		flex-wrap: wrap;
		justify-content: center;
		max-width: 80vw;

		&.vertical {
			flex-direction: column;
			align-items: center;
		}
	}

	@media screen and (max-width: 1100px) {
		.flex {
			max-width: 100vw;
		}
	}

	@media screen and (max-width: 500px) {
		.flex {
			display: flex;
			flex-direction: column;
			gap: 1em;
			flex-wrap: wrap;
			justify-content: center;
		}
	}
</style>
