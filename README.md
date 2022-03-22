# Tours API

API made with Node Express MongoDB

---

## Prerequisites

You need git to clone the repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

A number of node.js tools is necessary to initialize and test the project. You must have node.js and its package manager (npm) installed. You can get them from [http://nodejs.org/](http://nodejs.org/). The tools/modules used in this project are listed in package.json and include express, mongodb and mongoose.

## MongoDB

The project uses MongoDB as a database. If you are on Mac and using Homebrew package manager the installation is as simple as `brew install mongodb`.

## Getting Started

To get you started you can simply clone the repository:

    git clone https://github.com/cor4lion/Natours-API.git

## Project Setup

in the root, create .env file with these variables:

- MONGO_URL
- DATABASE_PASSWORD
- JWT_ACCESS_TOKEN
- PORT (if does not exist it will default to 8000)

then install the dependencies

    npm install

## Run the Application

The project is preconfigured with a simple development web server. The simplest way to start this server is:

    npm start

## View API Documentation

Go to /api-docs route to view the API documentation.
