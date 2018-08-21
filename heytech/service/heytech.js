import _ from 'lodash';
import {Telnet} from 'telnet-rxjs';
import config from 'config';

const newLine = String.fromCharCode(13);
const serverConfig = config.get('Heytech.lan');

const doTelNetStuff = (telnetCommands) => {


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
let doCommandForFenster = function (client, fenster, commandStr, pin) {
    if(!_.isEmpty(pin)){
        console.log('with pin')
        client.send('rsc');
        client.send(newLine);
        client.send(pin);
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
};
export const rollershutter = (fenster, commandStr) => {
    doTelNetStuff((client) => {
        doCommandForFenster(client, fenster, commandStr, serverConfig.pin);
    });
};

export const rollershutters = (fensters, commandStr) => {
    doTelNetStuff((client) => {
        fensters.forEach(fenster => {
            doCommandForFenster(client, fenster, commandStr, serverConfig.pin);
        });
    });
};

export const rollershuttersWithTimeout = (fensters, downTime, commandStr) => {
    doTelNetStuff((client) => {
        fensters.forEach(fenster => {
            doCommandForFenster(client, fenster, commandStr, serverConfig.pin);
        });
    });
    _.delay(() => {
        doTelNetStuff((client) => {
            fensters.forEach(fenster => {
                doCommandForFenster(client, fenster, 'off', serverConfig.pin);
            });
        });
    }, downTime)
};