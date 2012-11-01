var fs = require('fs'),
    util = require('util'),
    async = require('async'),
    DataLoad = require('./data-load');

var CustomerCatalogLoad = function(opts) {
	this.db = opts.db;
	this.loadFilePathRoot = opts.loadFilePathRoot;
	this.loadFilePath = this.loadFilePathRoot + "customer-catalogs\\";
	this.databaseTable = "customer_catalogs";
};  

util.inherits(CustomerCatalogLoad, DataLoad);

CustomerCatalogLoad.prototype.load = function() {
	var self = this;

	fs.readdir(self.loadFilePath, function(err, files) {

		if (err) {
			console.log("Could not read loadFilePath : " + self.loadFilePath);
			console.log(err);
			throw err;
		}

		if (files) {
			async.forEach(files, loadFile, function(err) {
				console.log("Unable to load customer catalogs.");
				console.log(err);
			});
		}
	});

};

module.exports = CustomerCatalogLoad;

var loadFile = function(file) {
	console.log(file);
}



