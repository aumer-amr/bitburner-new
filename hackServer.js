/** @param {NS} ns **/
export async function main(ns) {
	const args = ns.flags([["help", false]]);

	if (args.help || args._.length < 1) {
		ns.tprint("This script checks for root, then initiates the hack");
		ns.tprint(`Usage: run ${ns.getScriptName()} TARGET`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} n00dles`);
		return;
	}

	let target = args._[0];

	if (!ns.serverExists(target)) {
		return ns.tprint(`ERROR ${target} server does not exists`);
	}

	// let connected = ns.connect(target);
	// if (!connected) {
	// 	return ns.tprint(`Cannot connect to ${target}`);
	// }

	let hasRoot = ns.hasRootAccess(target);
	if (!hasRoot) {
		ns.print(`Does not have root access for ${target}, NUKING`);
		ns.nuke(target);
	}

	let timeoutSeconds = 30;
	let currentTimeout = 0;
	while(!hasRoot) {
		// Wait
		hasRoot = ns.hasRootAccess(target);
		ns.sleep(1000);
		if (++currentTimeout > timeoutSeconds) {
			return ns.tprint(`ERROR Timeout while nuking ${target}`);
		}
	}

	let moneyThresh = ns.getServerMaxMoney(target) * 0.75;
	let securityThresh = ns.getServerMinSecurityLevel(target) + 50;
	while(true) {
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			ns.print(`Weakening ${target}`);
			await ns.weaken(target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			ns.print(`Growing ${target}`);
			await ns.grow(target);
		} else {
			ns.print(`Hacking ${target}`);
			await ns.hack(target);
		}
	}
}