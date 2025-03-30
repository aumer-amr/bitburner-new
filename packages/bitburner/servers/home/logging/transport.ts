export type LogLevel = "info" | "warn" | "error" | "debug";

export interface TransportAttributes {
	hostname: string;
	scriptname: string;
}

export interface Transport {
	log: (level: LogLevel, attributes: TransportAttributes, message: string) => void;
}
