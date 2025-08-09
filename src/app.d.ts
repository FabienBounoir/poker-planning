// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Déclaration pour le web component emoji-picker-element
	namespace svelteHTML {
		interface IntrinsicElements {
			'emoji-picker': {
				'on:emoji-click'?: (event: CustomEvent<{ emoji: { unicode: string } }>) => void;
				style?: string;
			};
		}
	}
}

export { };
