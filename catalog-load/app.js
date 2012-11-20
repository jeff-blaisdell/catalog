var props = require('./config/config.json'),
    mongodb = require("mongodb"),
    mongoserver = new mongodb.Server(props.mongoHost, props.mongoPort, props.mongoServerOptions),
    db_connector = new mongodb.Db(props.mongoSchemaName, mongoserver, props.mongoDbOptions),
    DataLoadService = require("./service/data-load-service");


db_connector.open(function(err, db){
	if (err) {
		console.log("Unable to connect to database.");
		console.log(err);
		throw err;
	}

	var loadService = new DataLoadService({ "rootFilePath" : props.rootFilePath, "db" : db });
	loadService.load();
});    

