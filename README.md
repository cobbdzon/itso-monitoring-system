# CLA Monitoring System
## Running the database container
### Prerequisites
- podman and podman-docker (preferred) or docker (possibly)
- .postgres/data directory
- configured /etc/containers/registries.conf for podman
- lazydocker TUI for ease-of-use (optional) (remember to set DOCKER_HOST to podman's socket)

#### /etc/containers/registries.conf
```
[registries.search]
registries = ['docker.io']
```

The database container (podman) can be run using the following command:
```bash
podman compose up -d
```
