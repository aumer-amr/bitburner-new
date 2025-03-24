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

function findValidTarget(servers, serversTargeted, server) {
	const validServers = servers.filter(s => s != server);
	const target = validServers[Math.floor(Math.random() * validServers.length)];

	if (serversTargeted.includes(target)) {
		return findValidTarget(servers, serversTargeted, server);
	}

	return target;
}

/** @param {NS} ns **/
export async function main(ns) {
	const servers = list_servers(ns)
		.filter(s => ns.hasRootAccess(s));

	const serversTargeted = [];

	ns.tprint(`Found ${servers.length} servers`);
    for await (const server of servers) {
		ns.tprint(`- ${server}`);
	}

    for await (const server of servers) {
		ns.tprint(`Checking ${server}`);

		const target = findValidTarget(servers, serversTargeted, server);
		serversTargeted.push(target);

		ns.tprint(`Deploying hackServer.js on ${server} targeting ${target}`);

		const pid = ns.exec("hackServer.js", server, 1, target);
		await ns.sleep(1500);
		if (pid == 0) {
			ns.tprint(`Deploy failed for ${server}`);
		}
	}
}