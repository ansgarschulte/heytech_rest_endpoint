import _ from 'lodash';
import {Telnet} from 'telnet-rxjs';
import config from 'config';

const newLine = String.fromCharCode(13);
const serverConfig = config.get('Heytech.lan');


let lastStrings = '';
const START_SOP = 'start_sop';
const ENDE_SOP = 'ende_sop';
const START_SKD = 'start_skd';
const ENDE_SKD = 'ende_skd';

let connectedHeytechReader = false;

const doTelNetStuff = (telnetCommands) => {

    return new Promise((resolve, reject) => {
        const client = Telnet.client(serverConfig.host + ':' + serverConfig.port);


        lastStrings = '';

        client.filter((event) => event instanceof Telnet.Event.Connected)
            .subscribe(() => {
                telnetCommands(client);
            });

        client.data
            .subscribe((data) => {
                if (!connected) {
                    return;
                }
                lastStrings = lastStrings.concat(data);

                // SOP  Oeffnungs-Prozent
                if(lastStrings.indexOf(START_SOP) >= 0 && lastStrings.indexOf(ENDE_SOP)  >= 0){
                    // start_sop0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,100,100,100,100,100,100,100,100,100,100,0,100,100,100,100,100,100,ende_sop
                    var statusStr = lastStrings.substring(
                        lastStrings.indexOf(START_SOP) + START_SOP.length,
                        lastStrings.indexOf(ENDE_SOP)
                    );
                    const rolladenStatus = statusStr.split(',');
                    // console.log(rolladenStatus);
                    lastStrings = '';
                    client.disconnect();
                    connectedHeytechReader = false;
                    resolve(rolladenStatus);
                } else if (lastStrings.indexOf(START_SKD) >= 0 && lastStrings.indexOf(ENDE_SKD)  >= 0) {
                    // Klima-Daten
                    // start_skd37,999,999,999,999,19,0,18,19,0,0,0,0,0,37,1,ende_skd
                    var klimaStr = lastStrings.substring(
                        lastStrings.indexOf(START_SKD) + START_SKD.length,
                        lastStrings.indexOf(ENDE_SKD)
                    );
                    const klimadaten = klimaStr.split(',');
                    // console.log(lastStrings);
                    lastStrings = '';
                    client.disconnect();
                    connectedHeytechReader = false;
                    resolve(klimadaten);
                }
            });
        connectedHeytechReader = true;
        client.connect();
    });
};
const doCommand = function (client, commandStr, pin) {
    if(!_.isEmpty(pin)){
        console.log('with pin');
        client.send('rsc');
        client.send(newLine);
        client.send(pin);
        client.send(newLine);
        client.send(newLine);
    }
    client.send(commandStr);
    client.send(newLine);
    client.send(newLine);
};


export async function klima() {
    return await doTelNetStuff((client) => {
        doCommand(client, 'skd', serverConfig.pin);
    });
}

export async function oeffnungsProzent() {
    return await doTelNetStuff((client) => {
        doCommand(client, 'sop', serverConfig.pin);
    });
}

export const isConnected = () => {
    return connectedHeytechReader;
};