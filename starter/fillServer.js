function scan(ns, parent, server, list) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent == child) {
            continue;
        }
        list.push(child);

        scan(ns, server, child, list);
    }
}

function list_servers(ns) {
    const list = [];
    scan(ns, '', 'home', list);
    return list;
}

/** @param {NS} ns **/
export async function main(ns) {
	const servers = list_servers(ns)
		.filter(s => ns.hasRootAccess(s))
		.filter(s => !s.startsWith('amr'));

	const requiredRam = ns.getScriptRam("hackServer.js");

	let currentServer = ns.getServer();

	let serverRam = currentServer.maxRam;
	let freeRam = serverRam - currentServer.ramUsed;

	ns.tprint(`Found ${servers.length} servers`);
    for await (const server of servers) {
		ns.tprint(`- ${server}`);
	}

	while (freeRam > requiredRam) {
		const validServers = servers.filter(s => !s.startsWith('amr'));
		const target = validServers[Math.floor(Math.random() * validServers.length)];

		ns.tprint(`Deploying hackServer.js on ${currentServer.hostname} targeting ${target}`);

		const pid = ns.exec("hackServer.js", currentServer.hostname, 1, target);
		// await ns.sleep(500);
		if (pid == 0) {
			ns.tprint(`Deploy failed for ${server}`);
		}

		currentServer = ns.getServer();
		serverRam = currentServer.maxRam;
		freeRam = serverRam - currentServer.ramUsed;
	}
}