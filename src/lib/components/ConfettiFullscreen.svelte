<script>
	import { Confetti } from 'svelte-confetti';
</script>

<div class="confetti-fullscreen">
	<Confetti
		x={[-5, 5]}
		y={[0, 0.1]}
		delay={[500, 2000]}
		infinite
		duration={5000}
		amount={200}
		fallDistance="100dvh"
	/>
</div>

<style>
	.confetti-fullscreen {
		position: fixed;
		top: -50px;
		left: 0;
		height: 100dvh;
		width: 100dvw;
		display: flex;
		justify-content: center;
		overflow: hidden;
		pointer-events: none;
	}
</style>
