import { LogLevel, Transport, TransportAttributes } from './transport';

export class ConsoleTransport implements Transport {

	log(level: LogLevel, attributes: TransportAttributes, message: string) {
		console.log(`${level} - [${Object.values(attributes).join(", ")}] - ${message}`);
	}
}
