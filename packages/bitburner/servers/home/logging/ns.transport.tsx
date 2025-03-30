import { LogLevel, Transport, TransportAttributes } from './transport';
import React from 'react';

interface NSTransportOptions {
	readonly ns: NS | undefined;
}

interface LogEntryProps {
	level: LogLevel;
	attributes: TransportAttributes;
	message: string;
}

export class NSTransport implements Transport {

	constructor(private options: NSTransportOptions) { }

	log(level: LogLevel, attributes: TransportAttributes, message: string) {
		const ns = this.options.ns || overseer.ns;
		ns.tprintRaw(<LogEntry level={level} attributes={attributes} message={message} />);
	}
}

const LogEntry: React.FC<LogEntryProps> = ({ level, attributes, message }: { level: LogLevel, attributes: TransportAttributes, message: string }) => {
	const getLevelColor = (level: LogLevel) => {
		switch (level.toLowerCase()) {
			case "error":
				return "red";
			case "warn":
				return "yellow";
			case "info":
				return "cyan";
			case "debug":
				return "gray";
			default:
				return "black";
		}
	};

	return (
		<div>
			<span style={{"color": `${getLevelColor(level)}`}}>{level.toUpperCase()}</span>
			<span> - [{Object.values(attributes).join(", ")}] - {message}</span>
		</div>
	);
}
