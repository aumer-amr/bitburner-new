import { LoggerFactory } from '@/logging';
import { migrate } from '@/database/migrate';
import { instance as EventBus } from '@/eventbus/eventbus';
import { EventListener } from '@/eventbus/listener.decorator';
import { StopOverseerEvent } from '@/eventbus/events/stop.overseer.event';
import OverseerDashboard from '@/components/overseer';
import React from '@react';

import GlobalStyle from "@/styles/global.css";

export interface GlobalOverseer {
	ns: NS;
	logger: LoggerFactory;
	host: OverseerHostData;
}

export interface OverseerHostData {
	name: string;
	ram: {
		available: number;
		max: number;
	};
}

// RAM: 2.85 GB
export async function main(ns: NS) {
	const overseerInstance = Overseer.init(ns)
		.setup()
		.dashboard();

	overseer.logger.info("Overseer initialized successfully");

	await new Promise<void>((resolve) => {
		setInterval(() => {
			if (overseerInstance.isStopping()) {
				resolve();
				return;
			}
		}, 1000);
	});
}

class Overseer {
	static instance: Overseer;

	private stopping = false;

	@EventListener<StopOverseerEvent>(StopOverseerEvent.topic)
	static stop() {
		overseer.logger.info("Stopping overseer");
		Overseer.instance.setStopping(true);
	}

	isStopping() {
		return this.stopping;
	}

	setStopping(value: boolean) {
		this.stopping = value;
	}

	static init(ns: NS) {
		Overseer.instance = new Overseer(ns);
		return Overseer.instance;
	}

	constructor(private readonly ns: NS) {}

	// RAM: 0 GB
	dashboard() {
		this.ns.disableLog("ALL");
		this.ns.ui.openTail()
		this.ns.ui.resizeTail(500, 940)
		this.ns.ui.moveTail(1020, 25)
		this.ns.clearLog()

		this.ns.printRaw(<GlobalStyle />);
		this.ns.printRaw(<OverseerDashboard />);

		return this;
	}

	// RAM: 0.15 GB
	setup() {
		// Collect basic host information
		const hostName = this.ns.getHostname();
		const hostMaxRam = this.ns.getServerMaxRam(hostName);
		const hostRamUsed = this.ns.getServerUsedRam(hostName);

		const host = {
			name: hostName,
			ram: {
				available: hostMaxRam - hostRamUsed,
				max: hostMaxRam,
			}
		};

		if (!globalThis.overseer || Object.entries(globalThis.overseer).length === 0) {
			globalThis.overseer = {} as GlobalOverseer;
		}

		globalThis.overseer = {
			host,
			ns: this.ns,
			logger: new LoggerFactory({
				hostname: host.name,
				scriptname: this.ns.getScriptName()
			})
		};

		migrate();

		const eventBus = EventBus();
		eventBus.start();

		this.ns.atExit(async () => {
			overseer.logger.info("Overseer shutting down");
			this.ns.ui.closeTail();

			setTimeout(async () => {
				globalThis.overseer = {} as GlobalOverseer;
				await eventBus.close();
			}, 100);
		});

		return this;
	}
}

