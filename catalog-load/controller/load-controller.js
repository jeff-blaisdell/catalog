var fs = require('fs'),
    properties = require('../config/config.json'),
    AffiliateCatalogLoad = require('../load/affiliate-catalog-load'),
    CatalogProductGroupLoad = require('../load/catalog-product-group-load'),
    ProductLoad = require('../load/product-load'),
    mongodb = require("mongodb"),
    mongoserver = new mongodb.Server(properties.mongoHost, properties.mongoPort, properties.mongoServerOptions),
    db_connector = new mongodb.Db(properties.mongoSchemaName, mongoserver, properties.mongoDbOptions);;


var LoadController = function() {
};  

LoadController.prototype.begin = function() {

    db_connector.open(function(err, db){
        if (err) {
            console.log("Unable to connect to database.");
            console.log(err);
            throw err;
        }

        var affiliateCatalogLoad = new AffiliateCatalogLoad({ "loadFilePathRoot" : properties.loadFilePathRoot, "db" : db });
        var catalogProductGroupLoad = new CatalogProductGroupLoad({ "loadFilePathRoot" : properties.loadFilePathRoot, "db" : db });
        var productLoad = new ProductLoad({ "loadFilePathRoot" : properties.loadFilePathRoot, "db" : db });

        affiliateCatalogLoad.load();
        catalogProductGroupLoad.load();
        productLoad.load();

    });

};

module.exports = LoadController;