'use strict';


module.exports = function (app) {
    const heytech = require('../service/heytech');
    const heytechReader = require('../service/heytechReader');

    let tryCounter = 0;
    const checkHeytechNotConnected = (callback) => {
        if (heytech.isConnected() === true || heytechReader.isConnected()) {
            // console.log('heytech ist noch connected');
            tryCounter++;
            if (tryCounter > 10) {
                tryCounter = 0;
                callback();
            } else {
                setTimeout(checkHeytechNotConnected.bind(this, callback), 500); /* this checks the flag every 500 milliseconds*/
            }

        } else {
            callback();
        }
    };

    const config = require('config');

    const rolladenConfig = config.get('Heytech.rolladen');

    const routes = Object.keys(rolladenConfig);
    console.log(routes);
    routes.forEach((route) => {
        const routesConfig = rolladenConfig[route];
        if (typeof routesConfig === "string") {
            const fenster = routesConfig;
            app.get(route + ':command', function (req, res) {
                checkHeytechNotConnected(() => {
                    heytech.rollershutter(fenster, req.params.command);
                    res.send('OK');
                });
            });
        } else if (routesConfig instanceof Array) {
            const fensters = routesConfig;
            app.get(route + ':command', function (req, res) {
                checkHeytechNotConnected(() => {
                    heytech.rollershutters(fensters, req.params.command);
                    res.send('OK');
                });
            });
        } else if (routesConfig instanceof Object) {
            const fenstersConfig = routesConfig;
            app.get(route + ':command', function (req, res) {
                checkHeytechNotConnected(() => {
                    heytech.rollershuttersWithTimeout(fenstersConfig.rolladen, fenstersConfig.time, req.params.command);
                    res.send('OK');
                });
            });
        }
    });

    console.log('/heytech/klima');
    app.get('/heytech/klima', function (req, res) {
        checkHeytechNotConnected(() => {
            heytechReader.klima().then(data => {
                res.send(data);
            })
        });
    });

    console.log('/heytech/oeffnungsprozent');
    app.get('/heytech/oeffnungsprozent', function (req, res) {
        checkHeytechNotConnected(() => {
            heytechReader.oeffnungsProzent().then(data => {
                res.send(data);
            })
        });
    });

};
