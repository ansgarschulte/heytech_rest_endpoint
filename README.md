[![Build Status](https://travis-ci.org/ansgarschulte/heytech_rest_endpoint.svg?branch=master)](https://travis-ci.org/ansgarschulte/heytech_rest_endpoint)

## Heytech Rest Endpoint für Smarthome Integrationen wie OpenHab2 

Ziel dieses Projekt ist es meine HeyTech Rolladen Steuerung in OpenHab2 oder anderen SmartHome Software Lösungen zu integrieren.

## Version

* Version 1.1
    * Zugriff auf die Steuerung, wenn sie Pin geschützt ist.
* Version 1.0
    * Initiale funktionierende Version

### Quick-Setup

###### Runterladen der Sourcen
* Project klonen:
    * git clone https://github.com/ansgarschulte/heytech_rest_endpoint.git

###### Konfiguration
* editiere config/default.json

###### Installation
* npm install

###### Starten

* npm run start

### Docker Setup

* Project klonen
* editiere config/default.json
* baue und starte Docker Image 
    * docker-compose up -d


### Die Konfig Datei

Unter config/default.json befindet sich die Standard Konfigurationsdatei.

##### Lan Adapter
Im ersten Abschnitt dieser JSON Datei, muss man die Adresse und den Port des Heytech LAN Adapters konfigurieren:

```
"Heytech": {
    "lan": {
      "host": "10.0.1.6",
      "port": 1002
    },
    ....
```

Die IP Adresse haben Sie wahrscheinlich in der HeyControl HandyApp schonmal konfiguriert. Der Port sollte der gleiche sein.

#### Rolladen Konfiguration

Im Abschnitt "Rolladen" definiert man Rolladennamen und Rolladengruppen. Man beachte, dass der Wert der hier im Besipeil als "NAME" verwendet wird, später in der URL zur Steuerung dieser Rollade verwendet wird.
Daher müssen diese eindeutig sein.

```
"rolladen": {
    "NAME": ...
    }
```

##### Rolladen-Namen
Im zweiten Abschnitt gibt man den einzelnen Fenster Namen bzw. erstellt Rolladengruppen:

```
"rolladen": {
      "/kueche/": "2",
      "/schlafzimmer/": "3",
      ...
```
Das heißt, dass die Küchen Rollade am Heytech Rolladen Aktor am 2. Anschluß angeschlossen ist.

##### Rolladen-Gruppen

Hier eine Beispiel Konfiguration für eine Rolladengruppe
```
"rolladen": {
      ...
      "/rolladengruppe/eg/": [
              "9",
              "10",
              "11",
              "3",
              "4"
            ],
      ...
```

##### Rolladen-Gruppe mit Stop nach x Sekunden

Hier ein Beispiel für eine Rolladengruppe, die nach 10 Sekunden (10.000 ms) das herunter oder rauffahren stoppt.
Dies benutzte ich für teilweise Beschattung im Sommer.

```
"rolladen": {
     ...
    "/rolladengruppe/sun/schlafzimmer/": {
            "rolladen": [
              "7",
              "8"
            ],
            "time": 10000
          },
     ....
```

### Verwendung

Der Rest Endpunkt ist nun auf der Rechner erreichbar, auf dem das Docker Image läuft oder der Node Prozess gestartet wurde.

Man kann dies einfach im Browser testen, indem man die Beispiel URLs eingibt: 

z.B.: 
* http://SERVER-IP/rollanden/kueche/down
* http://SERVER-IP/rollanden/kueche/up
* http://SERVER-IP/rollanden/kueche/stop

* http://SERVER-IP/rolladengruppe/eg/down

* http://SERVER-IP/rolladengruppe/sun/schlafzimmer/down

Man beachte, dass als letztes in der URL der Rolladen Befehl mitgegeben werden muss.

* "down": Rolladen runter
* "up": Rolladen hoch
* "stop": Rolladen stop


### Einbindung in Openhab

Hat man nun der Heytech Rest Endpoint bei sich im Heimnetz laufen und kann seine Rolladen über den Browser steuern, kann man diese nun auch über OpenHab oder ähnliche SmartHome-Software Lösungen einfach steuern.

Hier am Beispiel von OpenHab2:

###### HTTP Binding
Benötigt wird in OpenHab das HTTP Binding. 
https://www.openhab.org/addons/bindings/http1/#http-binding

Nachdem dieses Konfiguriert ist, kann man seine Rolladen als Items definieren.

###### Items

Man legt normale Items in OpenHab mit Konfigurationsdateien an. Z.B. rolladen.items

```
Rollershutter   EG_Wohnzimmer_Rolladen  "Rolladen"   <rollershutter  (GF_LivingDining, gShutter)   {http=">[UP:GET:http://10.0.1.88:3000/rolladengruppe/wohnzimmer/up] >[DOWN:GET:http://10.0.1.88:3000/rolladengruppe/wohnzimmer/down]  >[STOP:GET:http://10.0.1.88:3000/rolladengruppe/wohnzimmer/off]"}
```

Dies ist die Beispiel Konfiguration für eine Rolladengruppe Wohnzimmer, die über das HTTP Binding und dem HeyTech Rest Endpoint gesteuert wird.
Der HeyTech Rest Endpoint läuft hier auf einem Server unter der IP 10.0.1.88

##### Rules
Natürlich kann man dann diese Rolladen auch über OpenHab Rules steuern.
Z.B. für Zeitbasierte oder Eventbasierte Steuerungen.
* Um 19 Uhr Rolladen runter
```
rule "Wohnzimmer Rolladen 19 Uhr"
when
    Time cron "0 0 19 1/1 * ? *"
then
    EG_Wohnzimmer_Rolladen.sendCommand(DOWN)
end
```

* Bei Sonnenuntergang Rolladen runter (dafür wird das Plugin xxx benötigt)
```
rule "Sunset spätestens 22 Uhr"
when
    Channel 'astro:sun:home:set#event' triggered END
then
    EG_Wohnzimmer_Rolladen.sendCommand(DOWN)
end
```

* oder andere komplexere Szenarien....
    * in Verbindung mit einem Fenstergriff Sensor habe ich umgesetzet, dass Abends die Wohnzimmer Rolladen nicht schließen, wenn das Fenster noch offen ist.
    * oder beim Schließen des Fensters nach Sonnenuntergang die Rolladen runterfahren.
    * Rolladen in Sonnenbeschattung fahren, wenn die Außentemperatur 25 Grad übersteigt
    * usw.
    

#### Alternatives Binding in OpenHab

Alternativ könnte man auch das TCP & UDP Binding in OpenHab verwenden.
https://www.openhab.org/addons/bindings/tcp1/#tcp-udp-binding
Davon rate ich allerdings ab, da es eine dauerhafte Telnet Verbindung zum Heytech Lan Adapter aufbaut und man somit, nicht mehr per HeyControl Handy oder PC Anwendung auf die Anlage zugreifen kann.