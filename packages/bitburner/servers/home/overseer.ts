import { LoggerFactory } from '@/logging';
import { generateStartingHash } from '@/init';
import { migrate } from '@/database/migrate';

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

// RAM: 1.6 GB
export async function main(ns: NS) {
	Overseer.setup(ns);
	await Overseer.checkRequirements(ns);
}

class Overseer {
	// RAM: 0 GB
	static setup(ns: NS) {
		globalThis.overseer.ns = ns;
		globalThis.overseer.logger = new LoggerFactory({
			hostname: globalThis.overseer.host.name,
			scriptname: ns.getScriptName()
		});

		migrate();
	}

	// RAM: 0 GB
	static async checkRequirements(ns: NS) {
		const flagSchema: [string, string][] = [
			['hash', 'string'],
			['key', 'string']
		];
		const flags = ns.flags(flagSchema);

		const requiredFlagsExist = flagSchema.every(f => flags[f[0]] !== undefined);
		if (!requiredFlagsExist) {
			overseer.logger.error("Missing required flags. Exiting");
			ns.exit();
		}

		const hashResult = await generateStartingHash(ns, flags.key as string);
		if (hashResult.hash !== flags.hash) {
			overseer.logger.error("Hash mismatch. Overseer can only be initialized by the init process. Exiting");
			ns.exit();
		}
	}
}