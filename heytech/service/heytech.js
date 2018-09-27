import _ from 'lodash';
import {Telnet} from 'telnet-rxjs';
import config from 'config';

const newLine = String.fromCharCode(13);
const serverConfig = config.get('Heytech.lan');

let connectedHeytech = false;
const doTelNetStuff = (telnetCommands) => {


    const client = Telnet.client(serverConfig.host + ':' + serverConfig.port);


    client.filter((event) => event instanceof Telnet.Event.Connected)
        .subscribe(() => {
            telnetCommands(client);
            client.disconnect();
            connectedHeytech = false;
        });
    client.connect();
    connectedHeytech = true;
};

const freeze = (time) => {
    const stop = new Date().getTime() + time;
    while(new Date().getTime() < stop);
};

const doCommandForFenster = function (client, fenster, commandStr, pin, withFreeze = false) {
    if(!_.isEmpty(pin)){
        console.log('with pin');
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

    if(withFreeze){
        freeze(100);
    }
};
export const rollershutter = (fenster, commandStr) => {
    doTelNetStuff((client) => {
        doCommandForFenster(client, fenster, commandStr, serverConfig.pin);
    });
};

export const rollershutters = (fensters, commandStr) => {
    doTelNetStuff((client) => {
        fensters.forEach(fenster => {
            doCommandForFenster(client, fenster, commandStr, serverConfig.pin, fensters.length > 2);
        });
    });
};

export const rollershuttersWithTimeout = (fensters, downTime, commandStr) => {
    doTelNetStuff((client) => {
        fensters.forEach(fenster => {
            doCommandForFenster(client, fenster, commandStr, serverConfig.pin, fensters.length > 2);
        });
    });
    _.delay(() => {
        doTelNetStuff((client) => {
            fensters.forEach(fenster => {
                doCommandForFenster(client, fenster, 'off', serverConfig.pin, fensters.length > 2);
            });
        });
    }, downTime)
};

export const isConnected = () => {
    return connectedHeytech;
};