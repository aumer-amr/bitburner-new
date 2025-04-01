import { OverseerEvent } from '@/eventbus/overseerevent';

export class StopOverseerEvent extends OverseerEvent {
	static readonly topic = 'stop.overseer';
	readonly data: any;

	constructor() {
		super();
		this.data = {};
	}
}