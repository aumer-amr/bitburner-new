import { OverseerEvent } from '@/eventbus/overseerevent';

export class EventBus {
	static instance: EventBus | undefined = undefined;
	readonly bridgeHost = "localhost:5000";
	subscribers = new Map<string, WebSocket[]>();

	async start() {
		return await fetch(`http://${this.bridgeHost}/pubsub/start`, {
			method: "POST"
		});
	}

	async publish(event: string, data: any) {
		return await fetch(`http://${this.bridgeHost}/pubsub/publish`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ event, data }),
		});
	}

	subscribe(channel: string, callback: (event: OverseerEvent) => void) {
		const ws = new WebSocket(`ws://${this.bridgeHost}/pubsub/subscribe/${channel}`);

		ws.onmessage = (message) => {
			const data = JSON.parse(message.data);
			callback(data);
		};

		ws.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

		ws.onclose = () => {
			console.log("WebSocket closed");
		};

		this.subscribers.set(channel, [...(this.subscribers.get(channel) || []), ws]);
	}

	async close() {
		for await (const [channel, sockets] of this.subscribers.entries()) {
			sockets.forEach((socket) => {
				socket.close();
			});

			await fetch(`http://${this.bridgeHost}/pubsub/unsubscribe/${channel}`, {
				method: "POST",
			});
		}
		this.subscribers.clear();
	}

}

export function instance() {
	if (!EventBus.instance) {
		EventBus.instance = new EventBus();
	}
	return EventBus.instance;
}