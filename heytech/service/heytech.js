import _ from 'lodash';
import {Telnet} from 'telnet-rxjs';
import config from 'config';

const newLine = String.fromCharCode(13);

const doTelNetStuff = (telnetCommands) => {
    const serverConfig = config.get('Heytech.lan');

    const client = Telnet.client(serverConfig.host + ':' + serverConfig.port);
    let connected = false;

    client.filter((event) => event instanceof Telnet.Event.Connected)
        .subscribe(() => {
            connected = true;
            telnetCommands(client);
            client.disconnect();
        });
    client.connect();
};
let doCommandForFenster = function (client, fenster, commandStr) {
    if(!_.isEmpty(serverConfig.pin)){
        client.send('rsc');
        client.send(newLine);
        client.send(serverConfig.pin);
        client.send(newLine);
        client.send(newLine);
    }
    client.send('rhi');
    client.send(newLine);
    client.send(newLine);
    client.send('rhb');
    client.send(newLine);
    client.send(fenster);
    client.send(newLine);
    client.send(commandStr === 'stop' ? 'off' : commandStr);
    client.send(newLine);
    client.send(newLine);
    client.send('rhe');
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