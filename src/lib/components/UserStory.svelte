<script lang="ts">
	import { scale } from 'svelte/transition';

	let { userStory } = $props();

	const includeUS_ID = (userStory: string) => {
		const match = userStory.match(/NFS-\d+/i);
		return match ? `https://portail.agir.orange.com/browse/${match[0]}` : null;
	};
</script>

{#if userStory}
	<div class="user-story" transition:scale={{ duration: 500 }}>
		<h3>User story</h3>
		{#if includeUS_ID(userStory) !== null}
			<h1>
				<a title="Open User story on jira" target="_blank" href={includeUS_ID(userStory)}
					>{userStory}</a
				>
			</h1>
		{:else}
			<h1>{userStory}</h1>
		{/if}
	</div>
{/if}

<style lang="scss">
	.user-story {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		color: var(--primary-950);
		width: 85vw;

		h1 {
			font-size: 2em;
			white-space: pre-line;
		}

		h3 {
			color: var(--primary-700);
		}
	}

	@media (prefers-color-scheme: dark) {
		.user-story {
			h1 {
				color: var(--primary-100);
			}
		}
	}
</style>
