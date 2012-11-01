var fs = require('fs'),
    properties = require('../config/config.json'),
    CustomerCatalogLoad = require('../load/customer-catalog-load'),
    CatalogLoad = require('../load/catalog-load'),
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

        var customerCatalogLoad = new CustomerCatalogLoad({ "loadFilePathRoot" : properties.loadFilePathRoot, "db" : db });
        var catalogLoad = new CatalogLoad({ "loadFilePathRoot" : properties.loadFilePathRoot, "db" : db });
        var productLoad = new ProductLoad({ "loadFilePathRoot" : properties.loadFilePathRoot, "db" : db });

        customerCatalogLoad.load();
        catalogLoad.load();
        productLoad.load();

    });

};

module.exports = LoadController;