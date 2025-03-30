import { LogLevel, Transport } from "@/logging/transport";
import { NSTransport } from "@/logging/ns.transport";
import { LokiTransport } from "@/logging/loki.transport";

export interface LoggingOptions {
	ns?: NS;
	hostname: string;
	scriptname: string;
	transports?: Transport[];
}

export class LoggerFactory {
	private options: LoggingOptions;
	private transports: Transport[];

	constructor(opts: LoggingOptions) {
		this.options = opts;

		if (!opts.transports) {
			this.transports = [
				new NSTransport({ ns: opts.ns }),
				new LokiTransport({
					url: "http://localhost:3100/loki/api/v1/push",
					batch: false
				}),
			];
		} else {
			this.transports = opts.transports;
		}
	}

	log(level: LogLevel, message: string) {
		const attributes = { hostname: this.options.hostname, scriptname: this.options.scriptname };
		this.transports.forEach((transport) => transport.log(level, attributes, message));
	}

	info(message: string) {
		this.log("info", message);
	}

	warn(message: string) {
		this.log("warn", message);
	}

	error(message: string) {
		this.log("error", message);
	}

	debug(message: string) {
		this.log("debug", message);
	}
}

export function factory(opts: LoggingOptions) {
	return new LoggerFactory(opts);
}