#Catalog
##Description
Catalog is a node based project with the purpose of exploring the Node.js environment.  
The project is divided into three sub-projects.

* catalog-data
	* JSON data files to be used by the catalog-load project.
* catalog-load
	* Will read the json flat files contained within catalog-data, and load a MongoDB database.
* catalog-web
	* A Node.js web application reliant on a MongoDB backend.	