# Bridge

Quick and dirty bridge for metrics from bitburner scripts to prometheus, so grafana can visualize them.
I've also added redis support so we don't have to deal with the ports inside bitburner and have a pub/sub system (will try to replace that with the ports inside bitburner later).