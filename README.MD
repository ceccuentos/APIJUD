# apiJUD Page Scraper

API Rest Extrae información desde la página del poder judicial (tribunal civil) para realizar inyección de datos en otros sistemas de control de trámites.

# Uso

Se debe indicar archivo .env con variables de entorno para Redis y generación de token.  Una vez utilizado debes llamar apiJUD/Login indicando usuario para que se te entregue token.
Una vez entregado se debe consumir la API desde una app o Postman.

### Tech

* [Puppeeter] - Scraping
* [Apify] - Se instala esta librería que ya contiene Puppeteer
* [JWT] - Autenticación
* [node.js] - eventos I/O para el backend
* [Express] - network app framework 
* [winston] - Librería para log
* [redis] - Uso de caching para evitar sobrecarga del server (120 ss)
* [jQuery] - en PuppeteerPara manejo de selectores

### Installation

Requires [Node.js](https://nodejs.org/) v11+ to run.


```sh
$ cd apiJud
$ npm install -d
$ node server/server
```


License
----

MIT
