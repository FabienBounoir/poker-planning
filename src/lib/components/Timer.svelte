<script>
	let { timer = false } = $props();
	let menuState = $state('close');

	const menuStateChange = () => {
		menuState = 'create';
	};
</script>

<button style="width: 10%;" on:click={menuStateChange} aria-label="Open menu timer">
	<i class="fa-solid fa-stopwatch" class:fa-beat-fade={timer}></i>
</button>

{#if menuState == 'create'}
	<div
		class="fullscreen"
		on:click={() => {
			menuState = 'close';
		}}
	>
		<label>Timer</label>
	</div>
{:else if menuState == 'update'}{/if}

<style lang="scss">
	.fullscreen {
		position: fixed;
		width: 100vw;
		height: 100dvh;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: red;
	}

	button {
		width: 100%;
		transition: background-color 0.3s !important;

		&:hover {
			background-color: var(--primary-600);
		}
	}
</style>
