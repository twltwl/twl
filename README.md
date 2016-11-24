# TWL Deploy
  Deploy your project via HTTP

  **0.0.2 alpha**

## Usage server
``` js
  //install twl npm package
  npm i -g twl

  //Install twl server
  //Outputs deploy token
  twl install

  //Add project
  //twl add "my-project" "/var/www/my-project"
  twl add -n [project-name] -p [project-dir]

  //Start twl server
  //twl start 4711
  twl start -p [port]

  //get token
  twl -t
```

## Usage client
``` js
  //install twl npm package
  npm i twl --save

  //create config file
  touch twl.config.json

  //Deploy artifact
  ./node_modules/.bin/twl deploy -c "twl.config.json"
```

## twl.config.json
``` js
{
  "token"     : "your-token",
  "name"      : "project-name",
  "url"       : "http://myserver.com", //server location
  "directory" : "/dist" //directory of files to create artifact from
}
```