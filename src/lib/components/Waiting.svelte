<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { scale, fly } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';

	let { players, observers, pokerAvatarType, DEFAUT_AVATAR_URL } = $props();

	interface Particle {
		id: string;
		x: number;
		y: number;
		vx: number;
		vy: number;
		radius: number;
		isDragging: boolean;
	}

	let particles = $state<Particle[]>([]);
	let greetings = $state<Set<string>>(new Set());
	let greetingMessages = $state<Map<string, string>>(new Map());
	let containerRef: HTMLDivElement;
	let animationFrame: number;
	let containerWidth = $state(0);
	let containerHeight = $state(0);
	let isInitialized = $state(false);
	let hasInitializedPlayers = $state(false);
	
	// Track mouse movement during drag for velocity calculation
	let lastMouseX = 0;
	let lastMouseY = 0;
	let lastMoveTime = 0;

	const PARTICLE_RADIUS = 35;
	const DAMPING = 0.98;
	const REPULSION = 800;
	const WALL_BOUNCE = 0.7;
	const THROW_MULTIPLIER = 2.5;

	const getRandomGreeting = () => {
		const greetingsList = $_('greetings') || ['Hello!'];
		const randomIndex = Math.floor(Math.random() * greetingsList.length);
		return greetingsList[randomIndex];
	};

	const createParticle = (playerId: string, showGreeting: boolean = true): Particle => {
		const particle: Particle = {
			id: playerId,
			x: Math.random() * (containerWidth - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS,
			y: Math.random() * (containerHeight - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS,
			vx: (Math.random() - 0.5) * 2,
			vy: (Math.random() - 0.5) * 2,
			radius: PARTICLE_RADIUS,
			isDragging: false
		};

		if (showGreeting) {
			greetings.add(playerId);
			greetingMessages.set(playerId, getRandomGreeting());

			setTimeout(() => {
				console.log(`Hiding greeting for player ${playerId}`);
				greetings.delete(playerId);
				greetingMessages.delete(playerId);
				greetings = new Set(greetings);
				greetingMessages = new Map(greetingMessages);
			}, 10000);
		}

		return particle;
	};

	// Sync particles with player list - incremental add/remove only
	$effect(() => {
		if (!players || containerWidth === 0 || containerHeight === 0) return;

		const currentPlayerIds = new Set(players.map((p: any) => p.id));
		const existingParticleIds = new Set(particles.map((p: Particle) => p.id));

		const toRemove = particles.filter((p: Particle) => !currentPlayerIds.has(p.id));
		const toAdd = players.filter((p: any) => !existingParticleIds.has(p.id));

		if (toRemove.length > 0 || toAdd.length > 0) {
			toRemove.forEach((p: Particle) => {
				greetings.delete(p.id);
				greetingMessages.delete(p.id);
			});

			let newParticles = particles.filter((p: Particle) => currentPlayerIds.has(p.id));

			// Show greeting only for players added after initial load
			for (const player of toAdd) {
				newParticles.push(createParticle(player.id, hasInitializedPlayers));
			}

			particles = newParticles;
		}

		if (!isInitialized && particles.length > 0) {
			isInitialized = true;
		}

		if (!hasInitializedPlayers && particles.length > 0) {
			hasInitializedPlayers = true;
		}
	});

	const updatePhysics = () => {
		if (!particles.length) return;

		// Apply repulsion forces between particles
		for (let i = 0; i < particles.length; i++) {
			if (particles[i].isDragging) continue;

			for (let j = i + 1; j < particles.length; j++) {
				const dx = particles[j].x - particles[i].x;
				const dy = particles[j].y - particles[i].y;
				const distance = Math.sqrt(dx * dx + dy * dy);
				const minDist = particles[i].radius + particles[j].radius;

				if (distance < minDist && distance > 0) {
					// Calculate repulsion force based on overlap
					const force = ((minDist - distance) / distance) * REPULSION;
					const fx = (dx / distance) * force * 0.01;
					const fy = (dy / distance) * force * 0.01;

					if (!particles[j].isDragging) {
						particles[j].vx += fx;
						particles[j].vy += fy;
					}
					if (!particles[i].isDragging) {
						particles[i].vx -= fx;
						particles[i].vy -= fy;
					}
				}
			}
		}

		particles.forEach((p) => {
			if (p.isDragging) return;

			p.x += p.vx;
			p.y += p.vy;

			p.vx *= DAMPING;
			p.vy *= DAMPING;

			// Wall collision detection
			if (p.x - p.radius < 0) {
				p.x = p.radius;
				p.vx *= -WALL_BOUNCE;
			} else if (p.x + p.radius > containerWidth) {
				p.x = containerWidth - p.radius;
				p.vx *= -WALL_BOUNCE;
			}

			if (p.y - p.radius < 0) {
				p.y = p.radius;
				p.vy *= -WALL_BOUNCE;
			} else if (p.y + p.radius > containerHeight) {
				p.y = containerHeight - p.radius;
				p.vy *= -WALL_BOUNCE;
			}
		});
	};

	const animate = () => {
		updatePhysics();
		animationFrame = requestAnimationFrame(animate);
	};

	const handleMouseDown = (e: MouseEvent, particleId: string) => {
		const particle = particles.find((p) => p.id === particleId);
		if (particle) {
			particle.isDragging = true;
			particle.vx = 0;
			particle.vy = 0;
			lastMouseX = e.clientX;
			lastMouseY = e.clientY;
			lastMoveTime = Date.now();
		}
	};

	const handleMouseMove = (e: MouseEvent) => {
		const dragging = particles.find((p) => p.isDragging);
		if (!dragging || !containerRef) return;

		const rect = containerRef.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Calculate velocity based on mouse movement for throw effect
		const now = Date.now();
		const dt = Math.max(now - lastMoveTime, 1);
		const dx = e.clientX - lastMouseX;
		const dy = e.clientY - lastMouseY;

		dragging.vx = (dx / dt) * THROW_MULTIPLIER;
		dragging.vy = (dy / dt) * THROW_MULTIPLIER;

		dragging.x = Math.max(PARTICLE_RADIUS, Math.min(containerWidth - PARTICLE_RADIUS, x));
		dragging.y = Math.max(PARTICLE_RADIUS, Math.min(containerHeight - PARTICLE_RADIUS, y));

		lastMouseX = e.clientX;
		lastMouseY = e.clientY;
		lastMoveTime = now;
	};

	const handleMouseUp = () => {
		particles.forEach((p) => {
			if (p.isDragging) {
				p.isDragging = false;
				// Limit maximum throw speed
				const maxSpeed = 25;
				const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
				if (speed > maxSpeed) {
					p.vx = (p.vx / speed) * maxSpeed;
					p.vy = (p.vy / speed) * maxSpeed;
				}
			}
		});
	};

	const handleTouchStart = (e: TouchEvent, particleId: string) => {
		e.preventDefault();
		const particle = particles.find((p) => p.id === particleId);
		if (particle && e.touches[0]) {
			particle.isDragging = true;
			particle.vx = 0;
			particle.vy = 0;
			lastMouseX = e.touches[0].clientX;
			lastMouseY = e.touches[0].clientY;
			lastMoveTime = Date.now();
		}
	};

	const handleTouchMove = (e: TouchEvent) => {
		e.preventDefault();
		const dragging = particles.find((p) => p.isDragging);
		if (!dragging || !containerRef || !e.touches[0]) return;

		const rect = containerRef.getBoundingClientRect();
		const x = e.touches[0].clientX - rect.left;
		const y = e.touches[0].clientY - rect.top;

		// Calculate velocity for throw effect
		const now = Date.now();
		const dt = Math.max(now - lastMoveTime, 1);
		const dx = e.touches[0].clientX - lastMouseX;
		const dy = e.touches[0].clientY - lastMouseY;

		dragging.vx = (dx / dt) * THROW_MULTIPLIER;
		dragging.vy = (dy / dt) * THROW_MULTIPLIER;

		dragging.x = Math.max(PARTICLE_RADIUS, Math.min(containerWidth - PARTICLE_RADIUS, x));
		dragging.y = Math.max(PARTICLE_RADIUS, Math.min(containerHeight - PARTICLE_RADIUS, y));

		lastMouseX = e.touches[0].clientX;
		lastMouseY = e.touches[0].clientY;
		lastMoveTime = now;
	};

	const handleTouchEnd = () => {
		particles.forEach((p) => {
			if (p.isDragging) {
				p.isDragging = false;
				const maxSpeed = 25;
				const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
				if (speed > maxSpeed) {
					p.vx = (p.vx / speed) * maxSpeed;
					p.vy = (p.vy / speed) * maxSpeed;
				}
			}
		});
	};

	const updateContainerSize = () => {
		if (containerRef) {
			containerWidth = containerRef.clientWidth;
			containerHeight = containerRef.clientHeight;
		}
	};

	onMount(() => {
		updateContainerSize();
		window.addEventListener('resize', updateContainerSize);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('touchmove', handleTouchMove, { passive: false });
		window.addEventListener('touchend', handleTouchEnd);
		animate();

		return () => {
			window.removeEventListener('resize', updateContainerSize);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', handleTouchEnd);
		};
	});

	onDestroy(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
	});
</script>

<h3 class="player-count-display">
	{players && players.length > 0 ? `${players.length} player${players.length > 1 ? 's' : ''}` : ''}
	{players && players.length > 0 && observers && observers.length > 0 ? ' + ' : ''}
	{observers && observers.length > 0
		? `${observers?.length} observer${observers.length > 1 ? 's' : ''}`
		: ''}
</h3>

<div class="waiting-message">
	<h1>{$_('RoomPage.waitingForVotes')}</h1>
	<div class="loading-dots">
		<span class="dot dot-1">.</span>
		<span class="dot dot-2">.</span>
		<span class="dot dot-3">.</span>
	</div>
</div>

<div class="particles-container" bind:this={containerRef}>
	{#if isInitialized && players}
		{#each particles as particle (particle.id)}
			{@const player = players.find((p: any) => p.id === particle.id)}
			{#if player}
				<div
					role="button"
					tabindex="0"
					class="player-display"
					class:dragging={particle.isDragging}
					style="transform: translate({particle.x - PARTICLE_RADIUS}px, {particle.y -
						PARTICLE_RADIUS}px);"
					onmousedown={(e) => handleMouseDown(e, player.id)}
					ontouchstart={(e) => handleTouchStart(e, player.id)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							const particle = particles.find((p) => p.id === player.id);
							if (particle) {
								particle.isDragging = true;
								particle.vx = 0;
								particle.vy = 0;
							}
						}
					}}
					in:scale={{ duration: 400, delay: 0, start: 0.5 }}
					out:fly={{ duration: 300, y: -50, opacity: 0 }}
				>
					<img
						alt="User-avatar"
						src={player?.avatar ||
							(pokerAvatarType || DEFAUT_AVATAR_URL) + `?seed=${player.name}`}
					/>
					<span>{player.name}</span>
					
					{#if greetings.has(particle.id)}
						<div class="greeting-bubble" in:scale={{ duration: 300, start: 0.5 }}>
							{greetingMessages.get(particle.id) || '👋 Hello!'}
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
</div>

<style lang="scss">
	.player-count-display {
		position: fixed;
		transform: translate(-50%, 0);
		padding: 1em;
		top: 0;
		left: 50%;
		color: var(--primary-700);
		font-weight: 800;
		font-size: 1.5em;
		border-radius: 5px;
		background-color: var();
		z-index: 10;
	}

	.particles-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		z-index: 1;
	}

	.player-display {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5em;
		cursor: grab;
		user-select: none;
		transition: filter 0.2s;
		will-change: transform;

		&:hover {
			filter: brightness(1.1);
		}

		&:active,
		&.dragging {
			cursor: grabbing;
			filter: brightness(1.2) drop-shadow(0 0 10px var(--primary-400));
			z-index: 1000;
		}

		img {
			border-radius: 100%;
			border: 2px solid var(--primary-700);
			width: 60px;
			height: 60px;
			object-fit: cover;
			pointer-events: none;
			background-color: var(--primary-100);
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
			transition: box-shadow 0.2s;

			@media (max-width: 480px) {
				width: 50px;
				height: 50px;
			}
		}

		span {
			font-size: 0.85em;
			font-weight: 600;
			text-align: center;
			word-break: break-word;
			max-width: 100px;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
			pointer-events: none;

			@media (max-width: 480px) {
				font-size: 0.75em;
				max-width: 70px;
			}
		}

		&.dragging img {
			box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
		}
	}

	.greeting-bubble {
		position: absolute;
		top: -15px;
		left: 30px;
		background: var(--primary-500);
		color: white;
		padding: 0.4em 0.8em;
		border-radius: 15px;
		font-size: 0.8em;
		font-weight: 600;
		white-space: nowrap;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		pointer-events: none;
		z-index: 100;
		animation: bubbleBounce 0.5s ease-out;

		&::before {
			content: '';
			position: absolute;
			bottom: -5px;
			left: 10px;
			width: 0;
			height: 0;
			border-left: 5px solid transparent;
			border-right: 5px solid transparent;
			border-top: 6px solid var(--primary-500);
		}
	}

	@keyframes bubbleBounce {
		0% {
			transform: scale(0) translateY(10px);
			opacity: 0;
		}
		50% {
			transform: scale(1.1) translateY(-2px);
		}
		100% {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	.waiting-message {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5em;
		z-index: 5;
		pointer-events: none;

		h1 {
			margin: 0;
			text-align: center;
		}
	}

	.loading-dots {
		display: flex;
		gap: 0.2em;
		align-items: center;
		justify-content: center;
	}

	.dot {
		font-size: 2em;
		font-weight: bold;
		color: var(--primary-600);
		animation: dotPulse 1.5s infinite ease-in-out;
		opacity: 0.4;

		&.dot-1 {
			animation-delay: 0s;
		}

		&.dot-2 {
			animation-delay: 0.3s;
		}

		&.dot-3 {
			animation-delay: 0.6s;
		}
	}

	@keyframes dotPulse {
		0%,
		60%,
		100% {
			opacity: 0.4;
			transform: scale(1);
		}
		30% {
			opacity: 1;
			transform: scale(1.2);
		}
	}

	@media (prefers-color-scheme: dark) {
		h1 {
			color: var(--primary-100);
		}

		.dot {
			color: var(--primary-400);
		}

		.player-count-display {
			color: var(--primary-300);
		}

		.player-display {
			color: var(--primary-400);

			img {
				background-color: var(--primary-800);
				border-color: var(--primary-500);
			}

			&:active,
			&.dragging {
				filter: brightness(1.3) drop-shadow(0 0 15px var(--primary-300));
			}
		}

		.greeting-bubble {
			background: var(--primary-600);

			&::before {
				border-top-color: var(--primary-600);
			}
		}
	}
</style>
