const _ = require('lodash');

const newLine = String.fromCharCode(13);

const doTelNetStuff = function (telnetCommands) {
    const {Telnet} = require('telnet-rxjs');
    const _ = require('lodash');
    const config = require('config');
    const serverConfig = config.get('Heytech.lan');

    const client = Telnet.client(serverConfig.host + ':' + serverConfig.port);
    let connected = false;

    client.filter((event) => event instanceof Telnet.Event.Connected)
        .subscribe((event) => {
            connected = true;

            telnetCommands(client);

            client.disconnect();
        });

    client.data
        .subscribe((data) => {
            if (!connected) {
                return;
            }
            console.log('Data: ' + data);
        });


    client.connect();
};
let doCommandForFenster = function (client, fenster, commandStr) {
    client.send('rhi');
    client.send(newLine);
    client.send(newLine);
    client.send('rhb');
    client.send(newLine);
    client.send(fenster);
    client.send(newLine);
    client.send(commandStr);
    client.send(newLine);
    client.send(newLine);
};
export const rollershutter = (fenster, commandStr) => {
    doTelNetStuff((client) => {
        doCommandForFenster(client, fenster, commandStr);
    });
};

export const rollershutters = (fensters, commandStr) => {
    doTelNetStuff((client) => {
        fensters.forEach(fenster => {
            doCommandForFenster(client, fenster, commandStr);
        });
    });
};

export const rollershuttersWithTimeout = (fensters, downTime, commandStr) => {
    doTelNetStuff((client) => {
        fensters.forEach(fenster => {
            doCommandForFenster(client, fenster, commandStr);
        });
    });
    _.delay(() => {
        doTelNetStuff((client) => {
            fensters.forEach(fenster => {
                doCommandForFenster(client, fenster, 'off');
            });
        });
    }, downTime)
};