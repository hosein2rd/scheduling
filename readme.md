# Scheduling

## start app

### note: install npm (node package manager) and node on your machine and install mysql for database

To start app follow these steps

1. open terminal and execute this command: `npm install`
2. execute `sequelize db:create` to create database

    note: if `sequelize` command did not found execute `npm i -g sequelize-cli`

3. execute `sequelize db:migrate` to create tables
4. check `config/config.json` to configuration database. If it is necessary change username and password 
5. execute this command: `npm start`
6. open your browser and go to `http://localhost:4000`