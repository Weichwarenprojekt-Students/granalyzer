<p align="center">
    <a href="https://weichwarenprojekt.github.io/granalyzer">
        <img src="client/src/assets/img/logo.svg" height="130" alt="granalyzer logo"/></a>
</p>
<h1 align="center">Visualize and edit complex graph data like never before</h1>

<p align="center">
    <a href="https://github.com/Weichwarenprojekt/granalyzer/actions/workflows/ci.yml">
        <img src="https://img.shields.io/github/workflow/status/weichwarenprojekt/granalyzer/CI?label=CI&logo=github" alt="tag" /></a>
    <a href="https://GitHub.com/weichwarenprojekt/granalyzer.js/releases/">
        <img src="https://img.shields.io/github/release/weichwarenprojekt/granalyzer.svg?logo=github" alt="release" /></a>
    <a href="https://GitHub.com/weichwarenprojekt/granalyzer.js/graphs/contributors/">
        <img src="https://img.shields.io/github/contributors/weichwarenprojekt/granalyzer.svg" alt="contributors" /></a>
    <a href="https://vuejs.org/">
        <img src="https://img.shields.io/badge/Node.js-v14.16.1-informational?logo=node.js&logoColor=white" alt="Vue.js" /></a>
    <a href="https://vuejs.org/">
        <img src="https://img.shields.io/badge/Vue.js-v3.0.0-informational?logo=vue.js" alt="Vue.js" /></a>
    <a href="https://nestjs.com/">
        <img src="https://img.shields.io/badge/NestJS-v7.6.13-informational?logo=nestjs" alt="NestJS" /></a>
    <a href="https://www.typescriptlang.org/">
        <img src="https://img.shields.io/badge/TypeScript-informational?logo=typescript&logoColor=white" alt="Typescript" /></a>
    <a href="https://neo4j.com/">
        <img src="https://img.shields.io/badge/Neo4j-informational?logo=neo4j&logoColor=white" alt="Neo4j" /></a>
    <a href="https://www.docker.com/">
        <img src="https://img.shields.io/badge/Docker-informational?logo=docker&logoColor=white" alt="Docker" /></a>
</p>

**Granalyzer** is an interactive web application that visualizes company data like software architectures,
(computer-)networks, system-infrastructures or general data from a Neo4j graph database.

This diagramming tool allows you to create and visualize graphs of elements and their relations to each other. As you
can reuse elements in multiple diagrams, creating those visualizations becomes remarkably fast.

**For more infos visit our [website](https://weichwarenprojekt.github.io/granalyzer)**!

# Deployment

The application can either be deployed locally (see [below](#local-deployment)) or via docker image.

## Deployment with Docker

The most recent release is available as docker image at http://ghcr.io/weichwarenprojekt/granalyzer:latest.

### Prerequisites

You need Docker and docker-compose installed on your system

### Deployment steps

Deployment in docker should ideally be done with docker-compose.

#### Neo4j database

If you have a running instance of a Neo4j database, you can skip this paragraph, but then you have to set up the
connection between granalyzer and Neo4j yourself.

The Neo4j database is best run in a separate docker-compose project, so that dependencies to granalyzer are kept to a
minimum.

```yaml
version: '3'
services:
  neo4j_container:
    image: neo4j:4.2-enterprise
    environment:
      - NEO4J_AUTH=neo4j/PASSWORD
      - NEO4J_ACCEPT_LICENSE_AGREEMENT=yes
      - NEO4J_dbms_security_procedures_unrestricted=apoc.\*
      - NEO4J_apoc_uuid_enabled=true
      - NEO4J_apoc_export_file_enabled=true
      - NEO4J_apoc_import_file_enabled=true
      - NEO4J_apoc_import_file_useneo4jconfig=true
      - NEO4JLABS_PLUGINS=["apoc"]
    container_name: neo4j_container
    volumes:
      - ./conf:/conf
      - ./data:/data
      - ./import:/import
      - ./logs:/logs
      - ./plugins:/plugins
```

* Create a new directory called “neo” and add the docker-compose.yml above.
    * The image version must include “enterprise”, because granalyzer uses features only supported by the enterprise
      version. You need an appropriate license for that; for testing purposes, you can apply for an evaluation license.
    * In the environment variable `NEO4J_AUTH` you need to specify the password of your instance, the username must be
      “neo4j”
    * The other environment variables install the APOC library and define settings for it
    * The container name is very important because it’s needed for communicating with the granalyzer container later on
    * The volumes define local directories which save the Neo4j data on the host’s file system
* Run `docker-compose up -d` to run the container in the background

##### Accessing the cypher shell of the Neo4j container

To access the cypher shell and run cypher queries directly on the database, execute the following command and replace
“neo4j_container” with the container name you specified in the docker-compose file.

`docker exec -it neo4j_container cypher-shell`

#### Granalyzer container

```yaml
version: '3'
services:
  granalyzer:
    image: ghcr.io/weichwarenprojekt/granalyzer:latest
    ports:
      - "127.0.0.1:8080:3000"
    environment:
      - DB_HOST=neo4j_container
      - DB_PORT=7687
      - DB_USERNAME=neo4j
      - DB_PASSWORD=PASSWORD
      - DB_TOOL=tool
      - DB_CUSTOMER=customer
      - SWAGGER_PREFIX=docs
      - API_PREFIX=api
      - BACKEND_PORT=3000
    working_dir: /app/server
    networks:
      - neo_default
      - default

networks:
  neo_default:
    external: true
```

* Create a new directory “granalyzer” with this docker-compose.yml.
    * You need to specify the ports you want to expose from the container.
      "127.0.0.1:8080:3000" means, that port 3000 of the backend is exposed to port 8080 on localhost. This means, that
      granalyzer is not reachable from outside of the machine.

      If you want to serve granalyzer publicly on your machine, you can remove 127.0.0.1 from the port definition.
    * If you are using a Neo4j Database not hosted by the docker-compose file shown above, we trust you to define the
      environment variables and network settings of this container yourself.
    * Otherwise, you need to define the values of the following environment variables:
        * `DB_HOST` must be the name of the Neo4j Docker container
        * `DB_PASSWORD` must be the password as specified in the neo4j docker-compose.yml
        * `DB_TOOL` and `DB_CUSTOMER` specify the names of the databases in the Neo4j database, where the tool DB saves
          all data needed for granalyzer itself, and the customer DB contains the company data of the customer
        * `BACKEND_PORT` must be the same as defined in the “ports” definition in the docker-compose file
        * The networks section defines the communication between the neo4j container and the granalyzer container. The
          network “neo_default” is used for communicating with the neo4j container, the “neo_” prefix originates from
          the directory which the neo4j docker-compose.yml lies in, so you need to change it if the directory has a
          different name!
* Run `docker-compose up -d` to run the container in the background
* The first time you are running granalyzer with a certain data set, you will need to create a new data scheme. You can
  do this either manually in the data scheme editor or you can use our data scheme generator script, which generates a
  data scheme on the current data in the database. The script can be run by executing `npm run scheme` in the server
  directory.

  To access the shell on the docker container you can execute `docker container exec -it granalyzer /bin/sh` which
  automatically puts you in the server directory. Please replace “granalyzer” with the correct name of you container,
  which you can find by executing `docker container ls` or if you specify it in the docker-compose file, like for the
  Neo4j database.

#### Updating the docker container

If you want to update granalyzer to a newer version, you just need to enter the “granalyzer” directory, where the
granalyzer docker-compose file is located, and execute the following commands.

* `docker-compose pull` – downloads the newest version of the `granalyzer:latest` image
* `docker-compose down` – stops granalyzer and removes the container
* `docker-compose up -d` – runs the container with the new image in the background

## Local deployment

### Prerequisites

* A clone of this repository
* A running instance of Neo4j Enterprise Edition with APOC library installed (e.g. the Neo4j docker container from
  above)
* Data imported into the Neo4j database
* Node.js 14.16 LTS installed on your PC

### Steps for deployment

* Go into “server” and “client” directories and run npm install in order to install the required versions of all node
  modules
* In the server directory, copy the file `example.env` to a new file called `.env`. In this file, configure the
  environment variables appropriately:
    * `DB_USERNAME`, `DB_PASSWORD`, `DB_PASSWORD` and `DB_PORT` specify how to connect to the Neo4j instance
    * `DB_TOOL` and `DB_CUSTOMER` specify the names of the databases in the Neo4j database, where the tool DB saves all
      data needed for granalyzer itself, and the customer DB contains the company data of the customer
    * `SWAGGER_PREFIX` defines the route for swagger API docs, defaults to “docs”
    * `API_PREFIX` defines the route for the rest API, currently must be “api” since there is no way yet to configure
      this route in the Vue frontend
    * `BACKEND_PORT` specifies the port of the node.js server, defaults to 3000

* In the server directory you can then execute npm run start:all:win or npm run start:all:linux depending on the
  operating system you are on. This will build frontend and backend for production and then start the node.js server
  which will serve both frontend and backend.
* The first time you are running granalyzer with this database, you will need to create a new data scheme. You can do
  this either manually in the data scheme editor or you can use our data scheme generator script, which generates a data
  scheme on the current data in the database. The script can be run by executing `npm run scheme` in the server
  directory.
* Now, granalyzer can be used by accessing “localhost:3000” (or on a different port, depending on what you specified
  above).