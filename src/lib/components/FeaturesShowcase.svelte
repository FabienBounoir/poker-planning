<script>
	import { _ } from 'svelte-i18n';
</script>

<div class="features-container">
	<!-- Feature 1: Estimation Methods -->
	<section class="feature-section estimation-section" data-feature="0">
		<div class="container left-right-layout">
			<div class="content-side">
				<div class="content-wrapper">
					<div class="feature-badge">
						<i class="fas fa-bullseye"></i>
						{$_('HomePage.features.estimation.badge')}
					</div>
					<h2>{$_('HomePage.features.estimation.title')}</h2>
					<p>
						{$_('HomePage.features.estimation.description')}
					</p>
					<div class="features-list">
						<div class="feature-item">
							<i class="fa-solid fa-check-to-slot"></i>
							{$_('HomePage.features.estimation.items.methods')}
						</div>
						<div class="feature-item">
							<i class="fas fa-bolt"></i>
							{$_('HomePage.features.estimation.items.interface')}
						</div>
						<div class="feature-item">
							<i class="fas fa-palette"></i>
							{$_('HomePage.features.estimation.items.design')}
						</div>
					</div>
				</div>
			</div>
			<div class="visual-side">
				<div class="estimation-demo">
					<div class="poker-table">
						<div class="card-deck">
							{#each ['XS', '1', '3', '?', '8', '∞', '5'] as card, i}
								<div
									class="poker-card {i === 3 ? 'selected' : ''}"
									style="animation-delay: {i * 0.2}s; z-index: {10 - i};"
								>
									<span class="card-value">{card}</span>
								</div>
							{/each}
						</div>
						<div class="selection-glow"></div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Feature 2: Simplified Voting -->
	<section class="feature-section voting-section" data-feature="1">
		<div class="container right-left-layout">
			<div class="visual-side">
				<div class="voting-demo">
					<div class="voting-interface">
						<div class="user-avatars">
							{#each Array(4) as _, i}
								<div class="user-avatar" style="animation-delay: {i * 200}ms;">
									<div class="avatar-ring"></div>
									<span class="user-initial">{String.fromCharCode(65 + i * 5)}</span>
									{#if i < 3}
										<div class="vote-indicator"><i class="fas fa-check"></i></div>
									{/if}
								</div>
							{/each}
						</div>
						<div class="vote-actions">
							<button class="vote-btn primary"
								><i class="fas fa-thumbs-up"></i>
								{$_('HomePage.features.voting.buttons.vote')}</button
							>
							<button class="vote-btn secondary"
								><i class="fas fa-sync-alt"></i>
								{$_('HomePage.features.voting.buttons.reveal')}</button
							>
						</div>
					</div>
				</div>
			</div>
			<div class="content-side">
				<div class="content-wrapper">
					<div class="feature-badge purple">
						<i class="fas fa-vote-yea"></i>
						{$_('HomePage.features.voting.badge')}
					</div>
					<h2>{$_('HomePage.features.voting.title')}</h2>
					<p>
						{$_('HomePage.features.voting.description')}
					</p>
					<div class="stats-grid">
						<div class="stat-item">
							<div class="stat-number">3s</div>
							<div class="stat-label">{$_('HomePage.features.voting.stats.averageTime')}</div>
						</div>
						<div class="stat-item">
							<div class="stat-number">100%</div>
							<div class="stat-label">{$_('HomePage.features.voting.stats.participation')}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Feature 3: Results & Analytics -->
	<section class="feature-section results-section" data-feature="2">
		<div class="container center-layout">
			<div class="content-header">
				<div class="feature-badge green">
					<i class="fas fa-chart-pie"></i>
					{$_('HomePage.features.results.badge')}
				</div>
				<h2>{$_('HomePage.features.results.title')}</h2>
				<p>
					{$_('HomePage.features.results.description')}
				</p>
			</div>

			<div class="results-dashboard">
				<div class="dashboard-grid">
					<div class="chart-container">
						<div class="chart-title">{$_('HomePage.features.results.chart.title')}</div>
						<div class="pie-chart">
							<div class="pie-slice slice-3" style="animation-delay: 1000ms;"></div>
							<div class="pie-slice slice-1" style="animation-delay: 600ms;"></div>
							<div class="pie-slice slice-2" style="animation-delay: 800ms;"></div>
							<div class="chart-center">
								<span class="consensus">8</span>
								<small>{$_('HomePage.features.results.chart.consensus')}</small>
							</div>
						</div>
					</div>

					<div class="metrics-panel">
						<div class="metric">
							<div class="metric-icon"><i class="fas fa-bolt"></i></div>
							<div class="metric-content">
								<div class="metric-value">2.4s</div>
								<div class="metric-label">
									{$_('HomePage.features.results.metrics.averageTime')}
								</div>
							</div>
						</div>
						<div class="metric">
							<div class="metric-icon"><i class="fas fa-bullseye"></i></div>
							<div class="metric-content">
								<div class="metric-value">92%</div>
								<div class="metric-label">{$_('HomePage.features.results.metrics.precision')}</div>
							</div>
						</div>
						<div class="metric">
							<div class="metric-icon"><i class="fas fa-users"></i></div>
							<div class="metric-content">
								<div class="metric-value">8/8</div>
								<div class="metric-label">
									{$_('HomePage.features.results.metrics.participants')}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Feature 4: Security & Privacy -->
	<section class="feature-section security-section" data-feature="3">
		<div class="container floating-layout">
			<div class="security-grid">
				<div class="security-card main-card">
					<div class="card-header">
						<div class="feature-badge orange">
							<i class="fas fa-lock"></i>
							{$_('HomePage.features.security.badge')}
						</div>
					</div>
					<h2>{$_('HomePage.features.security.title')}</h2>
					<p>
						{$_('HomePage.features.security.description')}
					</p>
				</div>

				<div class="security-card feature-card">
					<div class="security-icon"><i class="fas fa-shield-alt"></i></div>
					<h4>{$_('HomePage.features.security.features.encryption.title')}</h4>
					<p>{$_('HomePage.features.security.features.encryption.description')}</p>
				</div>

				<div class="security-card feature-card">
					<div class="security-icon"><i class="fas fa-clock"></i></div>
					<h4>{$_('HomePage.features.security.features.ephemeral.title')}</h4>
					<p>{$_('HomePage.features.security.features.ephemeral.description')}</p>
				</div>

				<div class="security-card feature-card">
					<div class="security-icon"><i class="fas fa-user-secret"></i></div>
					<h4>{$_('HomePage.features.security.features.anonymity.title')}</h4>
					<p>{$_('HomePage.features.security.features.anonymity.description')}</p>
				</div>

				<div class="security-visualization">
					<div class="shield-container">
						<div class="shield-core"><i class="fas fa-shield-alt"></i></div>
						<div class="protection-rings">
							{#each Array(5) as _, i}
								<div class="ring" style="animation-delay: {i * 200}ms;"></div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<style lang="scss">
	.features-container {
		width: 100%;
	}

	.feature-section {
		min-height: 100vh;
		width: 100%;
		display: flex;
		align-items: center;
		position: relative;
		overflow: hidden;
		padding: 6rem 0;

		&.estimation-section {
			background: var(--primary-50);
		}

		&.voting-section {
			background: var(--primary-100);
		}

		&.results-section {
			background: var(--primary-150);
		}

		&.security-section {
			background: var(--primary-200);
		}

		/* Transition douce entre les sections */
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 100px;
			background: linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
			pointer-events: none;
			z-index: 0;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 100px;
			background: linear-gradient(to top, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
			pointer-events: none;
			z-index: 0;
		}
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
		width: 100%;
		position: relative;
		z-index: 1;
	}

	/* Layout Types */
	.left-right-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}

	.right-left-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}

	.center-layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		max-width: 1000px;
	}

	.floating-layout {
		position: relative;
	}

	/* Content Styling */
	.content-side {
		padding: 2rem 0;
	}

	.content-wrapper {
		max-width: 500px;
	}

	.feature-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--primary-100);
		color: var(--primary-800);
		padding: 0.75rem 1.5rem;
		border-radius: 2rem;
		font-weight: 600;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
		border: 2px solid var(--primary-200);

		i {
			font-size: 1rem;
		}

		&.purple {
			background: var(--primary-100);
			color: var(--primary-900);
			border-color: var(--primary-300);
		}

		&.green {
			background: var(--primary-100);
			color: var(--primary-900);
			border-color: var(--primary-300);
		}

		&.orange {
			background: var(--primary-100);
			color: var(--primary-900);
			border-color: var(--primary-300);
		}
	}

	h2 {
		font-size: 3rem;
		font-weight: 900;
		color: var(--primary-950);
		margin-bottom: 1.5rem;
		line-height: 1.2;
	}

	p {
		font-size: 1.25rem;
		color: var(--primary-700);
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.features-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.feature-item {
		display: flex;
		align-items: center;
		font-size: 1.1rem;
		color: var(--primary-800);
		font-weight: 500;
		gap: 0.75rem;

		i {
			font-size: 1rem;
			color: var(--primary-600);
		}
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-top: 2rem;
	}

	.stat-item {
		text-align: center;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 1rem;
		backdrop-filter: blur(10px);
		border: 1px solid var(--primary-200);
	}

	.stat-number {
		font-size: 2.5rem;
		font-weight: 900;
		color: var(--primary-700);
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--primary-800);
		font-weight: 600;
	}

	/* Visual Demos */
	.visual-side {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
	}

	/* Estimation Demo */
	.estimation-demo {
		position: relative;
	}

	.poker-table {
		position: relative;
		width: 450px;
		height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card-deck {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 350px;
		height: 200px;
	}

	.poker-card {
		position: absolute;
		width: 60px;
		height: 90px;
		background: linear-gradient(145deg, var(--primary-50), var(--primary-100));
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.25rem;
		color: var(--primary-700);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		animation: cardDynamicShuffle 6s infinite ease-in-out;
		border: 2px solid var(--primary-300);
		transform-origin: center center;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		&:hover {
			transform: translate(-50%, -50%) scale(1.1);
			box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
			z-index: 30 !important;
		}

		&.selected {
			background: linear-gradient(145deg, var(--primary-600), var(--primary-700));
			color: var(--primary-50);
			animation: selectedCardHighlight 4s infinite ease-in-out;
			box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
			border-color: var(--primary-800);

			&:hover {
				transform: translate(-50%, -50%) scale(1.15);
				box-shadow: 0 15px 35px rgba(var(--primary-600-rgb, 37, 99, 235), 0.4);
				z-index: 35 !important;
			}
		}

		.card-value {
			font-size: 1.5rem;
			font-weight: 900;
			color: inherit;
		}
	}

	.selection-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 120px;
		height: 140px;
		background: radial-gradient(ellipse, var(--primary-400) 0%, transparent 70%);
		border-radius: 50%;
		animation:
			glowPulse 3s infinite ease-in-out,
			glowRotate 5s infinite ease-in-out;
		opacity: 0.4;
		filter: blur(2px);
	}

	/* Voting Demo */
	.voting-interface {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(15px);
		border-radius: 2rem;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--primary-200);
	}

	.user-avatars {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
		justify-content: center;
	}

	.user-avatar {
		position: relative;
		width: 60px;
		height: 60px;
		background: linear-gradient(145deg, var(--primary-100), var(--primary-200));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		color: var(--primary-700);
		animation: avatarBounce 2s infinite ease-in-out;

		.avatar-ring {
			position: absolute;
			top: -4px;
			left: -4px;
			right: -4px;
			bottom: -4px;
			border: 3px solid var(--primary-400);
			border-radius: 50%;
			opacity: 0;
			animation: ringAppear 2s infinite ease-in-out;
		}

		.vote-indicator {
			position: absolute;
			top: -5px;
			right: -5px;
			background: var(--primary-600);
			color: white;
			width: 24px;
			height: 24px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 0.75rem;
			font-weight: bold;
		}
	}

	.vote-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.vote-btn {
		padding: 1rem 2rem;
		border: none;
		border-radius: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;

		i {
			font-size: 0.875rem;
		}

		&.primary {
			background: var(--primary-500);
			color: white;

			&:hover {
				background: var(--primary-600);
				transform: translateY(-2px);
			}
		}

		&.secondary {
			background: rgba(255, 255, 255, 0.8);
			color: var(--primary-600);
			border: 2px solid var(--primary-200);

			&:hover {
				background: white;
				transform: translateY(-2px);
			}
		}
	}

	/* Results Demo */
	.content-header {
		margin-bottom: 4rem;
	}

	.results-dashboard {
		width: 100%;
		max-width: 800px;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		align-items: center;
	}

	.chart-container {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(15px);
		border-radius: 2rem;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--primary-200);
	}

	.chart-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--primary-900);
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.pie-chart {
		position: relative;
		width: 200px;
		height: 200px;
		margin: 0 auto;
		border-radius: 50%;
		overflow: hidden;
	}

	.pie-slice {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		animation: pieGrow 1.5s ease-out forwards;
		transform: scale(0);

		&.slice-1 {
			background: conic-gradient(
				from 0deg,
				var(--primary-400) 0deg,
				var(--primary-400) 144deg,
				transparent 144deg
			);
		}

		&.slice-2 {
			background: conic-gradient(
				from 144deg,
				var(--primary-600) 144deg,
				var(--primary-600) 252deg,
				transparent 252deg
			);
		}

		&.slice-3 {
			background: conic-gradient(
				from 252deg,
				var(--primary-800) 252deg,
				var(--primary-800) 360deg,
				transparent 360deg
			);
		}
	}

	.chart-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80px;
		height: 80px;
		background: white;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

		.consensus {
			font-size: 1.5rem;
			font-weight: 900;
			color: var(--primary-600);
		}

		small {
			font-size: 0.75rem;
			color: var(--primary-500);
		}
	}

	.metrics-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.metric {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(15px);
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--primary-200);
		animation: metricSlide 0.8s ease-out forwards;
		transform: translateX(50px);
		opacity: 0;

		&:nth-child(1) {
			animation-delay: 0.2s;
		}
		&:nth-child(2) {
			animation-delay: 0.4s;
		}
		&:nth-child(3) {
			animation-delay: 0.6s;
		}
	}

	.metric-icon {
		font-size: 2rem;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--primary-100);
		border-radius: 1rem;

		i {
			color: var(--primary-600);
		}
	}

	.metric-content {
		flex: 1;
	}

	.metric-value {
		font-size: 1.5rem;
		font-weight: 900;
		color: var(--primary-600);
		margin-bottom: 0.25rem;
	}

	.metric-label {
		font-size: 0.875rem;
		color: var(--primary-700);
		font-weight: 600;
	}

	/* Security Demo */
	.security-grid {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 2rem;
		height: 600px;
		position: relative;
	}

	.security-card {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(15px);
		border-radius: 2rem;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--primary-200);
		display: flex;
		flex-direction: column;
		justify-content: center;

		&.main-card {
			grid-row: 1 / -1;
			justify-content: flex-start;

			h2 {
				font-size: 2.5rem;
				margin-bottom: 1rem;
			}

			p {
				font-size: 1.1rem;
				margin-bottom: 0;
			}
		}

		&.feature-card {
			text-align: center;

			h4 {
				font-size: 1.25rem;
				font-weight: 800;
				color: var(--primary-900);
				margin: 1rem 0 0.5rem;
			}

			p {
				font-size: 0.9rem;
				color: var(--primary-700);
				margin: 0;
				font-weight: 500;
			}
		}
	}

	.security-icon {
		font-size: 3rem;
		margin-bottom: 1rem;

		i {
			color: var(--primary-600);
		}
	}

	.security-visualization {
		position: absolute;
		bottom: 2rem;
		right: 2rem;
		width: 200px;
		height: 200px;
	}

	.shield-container {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.shield-core {
		font-size: 4rem;
		z-index: 10;
		position: relative;
		animation: shieldFloat 3s infinite ease-in-out;

		i {
			color: var(--primary-600);
		}
	}

	.protection-rings {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.ring {
		position: absolute;
		border: 3px solid var(--primary-400);
		border-radius: 50%;
		opacity: 0.6;
		animation: ringExpand 3s infinite ease-in-out;

		&:nth-child(1) {
			top: 20%;
			left: 20%;
			right: 20%;
			bottom: 20%;
		}
		&:nth-child(2) {
			top: 15%;
			left: 15%;
			right: 15%;
			bottom: 15%;
			animation-delay: 0.3s;
		}
		&:nth-child(3) {
			top: 10%;
			left: 10%;
			right: 10%;
			bottom: 10%;
			animation-delay: 0.6s;
		}
		&:nth-child(4) {
			top: 5%;
			left: 5%;
			right: 5%;
			bottom: 5%;
			animation-delay: 0.9s;
		}
		&:nth-child(5) {
			top: 0%;
			left: 0%;
			right: 0%;
			bottom: 0%;
			animation-delay: 1.2s;
		}
	}

	/* Animations */
	@keyframes cardDynamicShuffle {
		0% {
			transform: translate(-50%, -50%) rotate(0deg) scale(1);
			z-index: 1;
		}
		12% {
			transform: translate(-120%, -80%) rotate(-25deg) scale(0.95);
			z-index: 8;
		}
		25% {
			transform: translate(20%, -120%) rotate(35deg) scale(1.05);
			z-index: 12;
		}
		37% {
			transform: translate(-90%, 20%) rotate(-15deg) scale(0.9);
			z-index: 6;
		}
		50% {
			transform: translate(80%, -50%) rotate(45deg) scale(1.1);
			z-index: 15;
		}
		62% {
			transform: translate(-20%, -90%) rotate(-30deg) scale(0.95);
			z-index: 9;
		}
		75% {
			transform: translate(-110%, 50%) rotate(25deg) scale(1.02);
			z-index: 11;
		}
		87% {
			transform: translate(60%, 20%) rotate(-20deg) scale(0.98);
			z-index: 7;
		}
		100% {
			transform: translate(-50%, -50%) rotate(0deg) scale(1);
			z-index: 1;
		}
	}

	@keyframes selectedCardHighlight {
		0%,
		100% {
			transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
			box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
			z-index: 25;
		}
		20% {
			transform: translate(-50%, -70%) scale(1.25) rotate(8deg);
			box-shadow: 0 20px 45px rgba(var(--primary-600-rgb, 37, 99, 235), 0.4);
			z-index: 25;
		}
		40% {
			transform: translate(-50%, -40%) scale(1.18) rotate(-5deg);
			box-shadow: 0 18px 40px rgba(var(--primary-600-rgb, 37, 99, 235), 0.35);
			z-index: 25;
		}
		60% {
			transform: translate(-50%, -65%) scale(1.22) rotate(12deg);
			box-shadow: 0 22px 50px rgba(var(--primary-600-rgb, 37, 99, 235), 0.45);
			z-index: 25;
		}
		80% {
			transform: translate(-50%, -45%) scale(1.15) rotate(-8deg);
			box-shadow: 0 16px 38px rgba(var(--primary-600-rgb, 37, 99, 235), 0.3);
			z-index: 25;
		}
	}

	@keyframes cardFloatGentle {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		33% {
			transform: translateY(-8px) rotate(1deg);
		}
		66% {
			transform: translateY(-4px) rotate(-1deg);
		}
	}

	@keyframes glowPulse {
		0%,
		100% {
			opacity: 0.2;
			transform: translate(-50%, -50%) scale(0.9);
		}
		50% {
			opacity: 0.4;
			transform: translate(-50%, -50%) scale(1.1);
		}
	}

	@keyframes glowRotate {
		0% {
			background: radial-gradient(ellipse, var(--primary-400) 0%, transparent 70%);
		}
		33% {
			background: radial-gradient(ellipse, var(--primary-500) 0%, transparent 70%);
		}
		66% {
			background: radial-gradient(ellipse, var(--primary-600) 0%, transparent 70%);
		}
		100% {
			background: radial-gradient(ellipse, var(--primary-400) 0%, transparent 70%);
		}
	}

	@keyframes avatarBounce {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	@keyframes ringAppear {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		50% {
			opacity: 1;
			transform: scale(1.1);
		}
		100% {
			opacity: 0;
			transform: scale(0.8);
		}
	}

	@keyframes pieGrow {
		from {
			transform: scale(0);
		}
		to {
			transform: scale(1);
		}
	}

	@keyframes metricSlide {
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes shieldFloat {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-10px) rotate(5deg);
		}
	}

	@keyframes ringExpand {
		0% {
			transform: scale(0.8);
			opacity: 0.8;
			border-color: var(--primary-400);
		}
		50% {
			transform: scale(1.2);
			opacity: 0.3;
			border-color: var(--primary-600);
		}
		100% {
			transform: scale(0.8);
			opacity: 0.8;
			border-color: var(--primary-400);
		}
	}

	/* Mobile Responsive */
	@media (max-width: 1024px) {
		.left-right-layout,
		.right-left-layout {
			grid-template-columns: 1fr;
			gap: 3rem;
		}

		.right-left-layout .visual-side {
			order: 1;
		}

		.right-left-layout .content-side {
			order: 2;
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.security-grid {
			grid-template-columns: 1fr;
			grid-template-rows: auto;
			height: auto;
		}

		.security-card.main-card {
			grid-row: auto;
		}

		.security-visualization {
			position: static;
			margin: 2rem auto 0;
		}

		.feature-section {
			min-height: auto;
			padding: 4rem 0;

			&::before,
			&::after {
				height: 50px;
			}
		}
	}

	@media (max-width: 768px) {
		.feature-section {
			padding: 3rem 0;
			min-height: auto;

			&::before,
			&::after {
				display: none;
			}
		}

		.container {
			padding: 0 1rem;
		}

		h2 {
			font-size: 2rem;
		}

		p {
			font-size: 1rem;
		}

		.poker-table {
			width: 300px;
			height: 200px;
		}

		.poker-card {
			width: 45px;
			height: 65px;
			font-size: 1rem;

			.card-value {
				font-size: 1.25rem;
			}
		}

		.user-avatars {
			gap: 0.5rem;
		}

		.user-avatar {
			width: 50px;
			height: 50px;
		}

		.vote-btn {
			padding: 0.75rem 1.5rem;
			font-size: 0.875rem;
		}

		.pie-chart {
			width: 150px;
			height: 150px;
		}

		.chart-center {
			width: 60px;
			height: 60px;

			.consensus {
				font-size: 1.25rem;
			}
		}

		.stats-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.security-card {
			padding: 1.5rem;

			&.main-card {
				h2 {
					font-size: 2rem;
				}
			}
		}

		.content-wrapper {
			max-width: 100%;
		}

		.visual-side {
			padding: 1rem;
		}
	}

	/* Mobile extra small */
	@media (max-width: 480px) {
		.feature-section {
			padding: 2rem 0;
		}

		h2 {
			font-size: 1.75rem;
		}

		.poker-table {
			width: 250px;
			height: 150px;
		}

		.poker-card {
			width: 35px;
			height: 50px;
			font-size: 0.875rem;

			.card-value {
				font-size: 1rem;
			}
		}

		.voting-interface {
			padding: 1.5rem;
		}

		.user-avatars {
			flex-wrap: wrap;
			justify-content: center;
		}

		.vote-actions {
			flex-direction: column;
			gap: 0.5rem;
		}

		.dashboard-grid {
			gap: 1.5rem;
		}

		.security-grid {
			gap: 1rem;
		}

		.feature-badge {
			font-size: 0.75rem;
			padding: 0.5rem 1rem;
		}
	}

	/* Dark Mode */
	@media (prefers-color-scheme: dark) {
		.feature-section {
			&.estimation-section {
				background: var(--primary-950);
			}

			&.voting-section {
				background: var(--primary-900);
			}

			&.results-section {
				background: var(--primary-950);
			}

			&.security-section {
				background: var(--primary-900);
			}

			&::before,
			&::after {
				background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
			}

			&::after {
				background: linear-gradient(to top, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
			}
		}

		h2 {
			color: var(--primary-50);
		}

		p {
			color: var(--primary-300);
		}

		.feature-item {
			color: var(--primary-200);
		}

		.poker-card {
			background: linear-gradient(145deg, var(--primary-800), var(--primary-700));
			color: var(--primary-100);
			border-color: var(--primary-600);
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

			&:hover {
				box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
			}

			&.selected {
				background: linear-gradient(145deg, var(--primary-500), var(--primary-400));
				color: var(--primary-950);
				border-color: var(--primary-300);
				box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);

				&:hover {
					box-shadow: 0 15px 35px rgba(var(--primary-400-rgb, 96, 165, 250), 0.4);
				}
			}
		}

		.voting-interface,
		.chart-container,
		.security-card,
		.stat-item,
		.metric {
			background: rgba(255, 255, 255, 0.1);
			border-color: var(--primary-700);
		}

		.chart-title {
			color: var(--primary-100);
		}

		.stat-label {
			color: var(--primary-200);
		}

		.stat-number {
			color: var(--primary-100);
		}

		.security-card.feature-card {
			h4 {
				color: var(--primary-100);
			}

			p {
				color: var(--primary-200);
			}

			.security-icon i {
				color: var(--primary-400);
			}
		}

		.shield-core i {
			color: var(--primary-400);
		}

		.chart-center {
			background: var(--primary-800);

			.consensus {
				font-size: 1.25rem;
				color: var(--primary-100);
			}

			small {
				color: var(--primary-100);
			}
		}

		.metric-icon {
			i {
				color: var(--primary-400);
			}
		}

		.metric-value {
			color: var(--primary-400);
		}

		.metric-label {
			color: var(--primary-200);
		}

		.feature-badge {
			background: var(--primary-800);
			color: var(--primary-200);
			border-color: var(--primary-600);

			&.purple,
			&.green,
			&.orange {
				background: var(--primary-800);
				color: var(--primary-200);
				border-color: var(--primary-600);
			}
		}
	}
</style>
