import { writable } from 'svelte/store';

/**
 * @type {import("svelte/store").Writable<Awaited<ReturnType<import("@discord/embedded-app-sdk").DiscordSDK["commands"]["authenticate"]>> & {
 *  ws: {
 *      socket: WebSocket;
 *      on(event: string, callback: (payload: any) => void): void;
 *      emit(event: string, data?: any): void;
 *  };
 *  channel: Awaited<ReturnType<DiscordSDK["commands"]["getChannel"]>>
 * }>}
 */
// @ts-ignore
export const websocket = writable();