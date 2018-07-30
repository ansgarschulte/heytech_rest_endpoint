'use strict';

module.exports = function (app) {
    const heytech = require('../service/heytech');
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

};
