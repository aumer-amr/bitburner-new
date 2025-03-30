import { factory } from '@/logging';

const OVERSEER_SCRIPT = "overseer.js";

export interface StartingHash {
	key: string;
	hash: string;
}

// RAM: 3.05 GB
export async function main(ns: NS) {
	await setup(ns);
	await checkRequirements(ns);

	overseer.logger.info("Starting overseer");

	const startingHash = await generateStartingHash(ns);

	const pid = ns.run(OVERSEER_SCRIPT, {
		preventDuplicates: true,
		threads: 1
	},
		`--hash=${startingHash.hash}`,
		`--key=${startingHash.key}`
	);

	if (pid === 0) {
		overseer.logger.error("Failed to start overseer");
		ns.exit();
	}
}

// RAM: 0.15 GB
async function setup(ns: NS) {
	ns.disableLog("ALL");

	if (ns.isRunning(OVERSEER_SCRIPT)) {
		ns.tprint("overseer.js is already running. Exiting");
		ns.exit();
	}

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

	// Load the logging library
	const logger = factory({ ns: ns, hostname: host.name, scriptname: ns.getScriptName() });

	// Set up the global overseer object
	globalThis.overseer.logger = logger;
	globalThis.overseer.host = host;
}

// RAM: 0.2 GB
async function checkRequirements(ns: NS) {
	const overseerExists = ns.fileExists(OVERSEER_SCRIPT);
	if (!overseerExists) {
		overseer.logger.error(`${OVERSEER_SCRIPT} does not exist. Exiting`);
		ns.exit();
	}

	const overseerRamRequirement = ns.getScriptRam(OVERSEER_SCRIPT, overseer.host.name);
	if (overseerRamRequirement > overseer.host.ram.available) {
		overseer.logger.error(`Not enough RAM to run ${OVERSEER_SCRIPT}. Required: ${overseerRamRequirement} GB, Available: ${overseer.host.ram.available} GB`);
		ns.exit();
	}
}

// RAM: 0 GB
export async function generateStartingHash(ns: NS, key?: string): Promise<StartingHash> {
	const content = ns.read(OVERSEER_SCRIPT);

	if (!key) {
		key = crypto.randomUUID();
	}

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(key),
		{ name: "HMAC", hash: { name: "SHA-256" } },
		false,
		["sign"]
	);

	const hashBuffer = await crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		new TextEncoder().encode(content)
	);

    return {
		key,
		hash: Array.from(new Uint8Array(hashBuffer))
			.map(byte => byte.toString(16).padStart(2, "0"))
			.join("")
	};
}