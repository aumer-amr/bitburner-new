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

export function list_servers(ns) {
    const list = [];
    scan(ns, '', 'home', list);
    return list;
}

/** @param {NS} ns **/
export async function main(ns) {
    while(true) {
        const player = ns.getPlayer();
        const playerHackingLevel = player.skills.hacking;
        const servers = list_servers(ns);
        for(const server of servers) {
            if (server == 'darkweb') continue;

            const serverHackingLevel = ns.getServerRequiredHackingLevel(server);

            if (serverHackingLevel <= playerHackingLevel && !ns.hasRootAccess(server)) {
                const numPortsRequired = ns.getServerNumPortsRequired(server);

                const hacks = [
                    'brutessh.exe',
                    'ftpcrack.exe',
                    'relaysmtp.exe',
                    'httpworm.exe'
                ];

                const canHack = hacks.filter(hack => ns.fileExists(hack, 'home')).length >= numPortsRequired;
                if (!canHack) {
                    continue;
                }

                ns.tprint(`WARN ${server}: No root - ${serverHackingLevel}|${playerHackingLevel}`)

                try {
                    if (numPortsRequired >= 1) {
                        ns.brutessh(server);
                    }

                    if (numPortsRequired >= 2) {
                        ns.ftpcrack(server);
                    }

                    if (numPortsRequired >= 3) {
                        ns.relaysmtp(server);
                    }

                    if (numPortsRequired >= 4) {
                        ns.httpworm(server);
                    }
                } catch (e) {
                    ns.print(`Cannot execute all hacks due availability`);
                }

                ns.nuke(server);

                await ns.sleep(1000);

                // ns.installBackdoor(server);

                // await ns.sleep(1000);

                ns.scp('hackServer.js', server);

                ns.tprint(`New target completed ${server}, run backdoor on this!`);
            }
        }
        await ns.sleep(30 * 1000)
    }
}