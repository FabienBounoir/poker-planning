<script>
	let { valided } = $props();
</script>

{#if valided}
	<svg xmlns="http://www.w3.org/2000/svg" width="35px" viewBox="0 0 24 24" fill="none">
		<path
			d="M7 12L9.89075 14.8907V14.8907C9.95114 14.951 10.049 14.9511 10.1094 14.8907V14.8907L17 8"
			stroke="var(--primary-950)"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{:else}
	<svg xmlns="http://www.w3.org/2000/svg" width="35px" viewBox="0 0 24 24" fill="none">
		<path
			d="M7 7L17 17"
			stroke="var(--primary-900)"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M17 7L7 17"
			stroke="var(--primary-900)"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{/if}
