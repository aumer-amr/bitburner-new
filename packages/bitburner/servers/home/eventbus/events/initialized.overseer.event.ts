import { OverseerEvent } from '@/eventbus/overseerevent';

export class InitializedOverseerEvent extends OverseerEvent {
	static readonly topic = 'init.overseer';

	readonly data: {
		startedAt: number;
	};

	constructor() {
		super();
		this.data = {
			startedAt: Date.now()
		};
	}
}