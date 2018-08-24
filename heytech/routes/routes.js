'use strict';


module.exports = function (app) {
    const heytech = require('../service/heytech');
    const heytechReader = require('../service/heytechReader');
    const config = require('config');

    const rolladenConfig = config.get('Heytech.rolladen');

    const routes = Object.keys(rolladenConfig);
    console.log(routes);
    routes.forEach((route) => {
        const routesConfig = rolladenConfig[route];
        if (typeof routesConfig === "string") {
            const fenster = routesConfig;
            app.get(route + ':command', function (req, res) {
                heytech.rollershutter(fenster, req.params.command);
                res.send('OK');
            });
        } else if (routesConfig instanceof Array) {
            const fensters = routesConfig;
            app.get(route + ':command', function (req, res) {
                heytech.rollershutters(fensters, req.params.command);
                res.send('OK');
            });
        } else if (routesConfig instanceof Object) {
            const fenstersConfig = routesConfig;
            app.get(route + ':command', function (req, res) {
                heytech.rollershuttersWithTimeout(fenstersConfig.rolladen, fenstersConfig.time, req.params.command);
                res.send('OK');
            });
        }
    });

    console.log('/heytech/klima');
    app.get('/heytech/klima', function(req, res) {
        heytechReader.klima().then(data => {
            res.send(data);
        })
    });

    console.log('/heytech/oeffnungsprozent');
    app.get('/heytech/oeffnungsprozent', function(req, res) {
        heytechReader.oeffnungsProzent().then(data => {
            res.send(data);
        })
    });

};
