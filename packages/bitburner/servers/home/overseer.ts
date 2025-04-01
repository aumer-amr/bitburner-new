import { LoggerFactory } from '@/logging';
import { migrate } from '@/database/migrate';
import { instance as EventBus } from '@/eventbus/eventbus';
import { EventListener } from '@/eventbus/listener.decorator';
import { StopOverseerEvent } from '@/eventbus/events/stop.overseer.event';

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
	const overseerInstance = Overseer.init()
		.setup(ns);

	const command = overseerInstance.parseCommands(ns);
	if (command?.stop) {
		ns.fileExists(`commands/stop.js`, 'home') && ns.run(`commands/stop.js`);
		return;
	}

	overseer.logger.info("Overseer initialized successfully");

	while (!overseerInstance.isStopping()) {
		await ns.sleep(1000);
	}
}

class Overseer {
	static instance: Overseer | undefined = undefined;

	private stopping = false;

	@EventListener<StopOverseerEvent>(StopOverseerEvent.topic)
	static stop() {
		overseer.logger.info("Stopping overseer");
		Overseer.init().setStopping(true);
	}

	isStopping() {
		return this.stopping;
	}

	setStopping(value: boolean) {
		this.stopping = value;
	}

	static init() {
		if (!Overseer.instance) {
			Overseer.instance = new Overseer();
		}
		return Overseer.instance;
	}

	// RAM: 0.15 GB
	setup(ns: NS) {
		ns.disableLog("ALL");

		// Collect basic host information
		const hostName = ns.getHostname();
		const hostMaxRam = ns.getServerMaxRam(hostName);
		const hostRamUsed = ns.getServerUsedRam(hostName);

		const host = {
			name: hostName,
			ram: {
				available: hostMaxRam - hostRamUsed,
				max: hostMaxRam,
			}
		};

		if (!globalThis.overseer) {
			globalThis.overseer = {} as GlobalOverseer;
		}

		globalThis.overseer = {
			host,
			ns,
			logger: new LoggerFactory({
				hostname: host.name,
				scriptname: ns.getScriptName()
			})
		};

		migrate();

		const eventBus = EventBus();
		ns.atExit(async () => {
			overseer.logger.info("Overseer shutting down");
			await eventBus.close();
		});

		return this;
	}

	// RAM: 0 GB
	parseCommands(ns: NS) {
		const validCommands = ['stop', 'start', 'restart', 'status'];
		const foundCommand = ns.args.find(arg => validCommands.includes(arg as string));

		if (foundCommand) {
			overseer.logger.info(`Running command: ${foundCommand}`);
			return {
				stop: foundCommand === 'stop',
				start: foundCommand === 'start',
				restart: foundCommand === 'restart',
				status: foundCommand === 'status'
			}
		}

		return null;
	}
}