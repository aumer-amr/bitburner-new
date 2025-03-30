import { LogLevel, Transport, TransportAttributes } from './transport';

export interface LokiTransportOptions {
	url: string;
	batch: boolean;
	batchInterval?: number;
}

interface QueuedMessage {
	level: LogLevel;
	attributes: TransportAttributes;
	timestamp: bigint;
	message: string;
}

export class LokiTransport implements Transport {
	private queuedMessages: QueuedMessage[] = [];

	constructor(private options: LokiTransportOptions) {
		if (options.batch) {
			setInterval(() => this.flush(), this.options.batchInterval || 1000);
		}
	}

	async log(level: LogLevel, attributes: TransportAttributes, message: string) {
		this.queuedMessages.push({
			level,
			attributes,
			timestamp: BigInt(Date.now()) * 1_000_000n,
			message
		});

		if (!this.options.batch) {
			await this.flush();
		}
	}

	async flush() {
		const messages = this.queuedMessages;
		this.queuedMessages = [];

		const groupedMessages = messages.reduce((acc, message) => {
			const key = `${message.level}-${message.attributes.hostname}-${message.attributes.scriptname}`;
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(message);
			return acc;
		}, {} as Record<string, QueuedMessage[]>);

		const body = Object.values(groupedMessages).map((group: QueuedMessage[]) => {
			return {
				stream: {
					...group[0].attributes,
					level: group[0].level
				},
				values: group.map((message) => {
					return [message.timestamp.toString(), message.message];
				})
			};
		});

		await fetch(this.options.url, {
			method: "POST",
			body: JSON.stringify({ streams: body }),
			headers: { "Content-Type": "application/json" }
		});
	}
}