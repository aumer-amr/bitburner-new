I went overboard to challenge myself on my second playthrough. In my first playthrough I integrated vue inside the game (I only knew vue back then), and overhauled the whole interface.

Now I'm opensourcing my second playthrough, with some explanations. I'm using a monorepo that consists of a few packages:
- bitburner: The game itself
- bridge: A bridge between the game and prometheus

On the side in docker containers I'm running a grafana instance and a prometheus instance. The bridge ingest metric data from the game and exposing it to prometheus. Grafana is then querying prometheus to display the data.

---

# Overseer
The heart and soul of my setup, overseer is the orchestrator of the whole setup.

< insert diagram when finished>

## Init process
The init process checks for the basic requirements and setups a minimal environment inside bitburner. It also generates a hash and send that to the overseer script on run as flags. This hash will be calculated once more on the overseer side to verify the integrity of the init process. The reason why I chose for such complex startup process is because I want to make sure that the init always happens, and not accidently skipped by running overseer directly.