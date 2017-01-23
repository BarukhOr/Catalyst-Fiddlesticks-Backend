# Catalyst-Fiddlesticks-Backend

> A Node.js project

## Build Setup

``` bash
# install dependencies
npm install

# start server at localhost:7000
npm start
```
## Additional Setup

```
# other dependencies
You will also need to setup and install postgresql
Additionally you may want to install pgadmin 3 (or 4) to easily interface with the database

Having done so, create a database called (catalyst_db) and then run the db initialization script (by copy and pasting it into the sql editor)
(db_init script is located in docs/db_init/index.sql)

in the config/index.js file
set the'tower_db_server' parameter to the url pointing to your postgresql db instance e.g.

'tower_db_server': 'postgres://postgres:password@localhost:5432/database_name'

And that should be it
```

~ Happy Coding ~

Note: Using JSLint for linting.
