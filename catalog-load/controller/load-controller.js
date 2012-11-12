var fs = require('fs'),
    props = require('../config/config.json'),
    mongodb = require("mongodb"),
    DataLoad = require("../load/data-load"),
    mongoserver = new mongodb.Server(props.mongoHost, props.mongoPort, props.mongoServerOptions),
    db_connector = new mongodb.Db(props.mongoSchemaName, mongoserver, props.mongoDbOptions);;


var LoadController = function() {
};  

LoadController.prototype.load = function() {

    db_connector.open(function(err, db){
        if (err) {
            console.log("Unable to connect to database.");
            console.log(err);
            throw err;
        }

        var load = new DataLoad({ "rootFilePath" : props.rootFilePath, "db" : db });

        load.on("files-loaded", function() {
            console.log("Files are processed!");
            db.close(true, function(err, result) {
                if (err) {
                    console.log("Failure.");
                    console.log(err);
                    throw err;
                }
                console.log("Database connection closed.");
                console.log("Finished.");
            });
        });

        load.start();
    });

};

module.exports = LoadController;