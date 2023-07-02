# webrtc-group-chat-demo

A web application to realize P2P features including video calling, screen sharing, text messaging and file transceiving with low lantency

![alt text](https://github.com/myan0020/webrtc-group-chat-demo/blob/master/screenshots/chat_text.png?raw=true)

![alt text](https://github.com/myan0020/webrtc-group-chat-demo/blob/master/screenshots/chat_file.png?raw=true)

## Prerequisites:

A secure context, avaliable TURN server urls or a private TURN server

## For development:

**Step 1**: clone this project into your local machine, move into it and install all dependencies;
```
$ git clone https://github.com/myan0020/webrtc-group-chat-demo.git
$ cd webrtc-group-chat-demo
$ npm install
```

**Step 2**: start a webpack dev server to serve web pages and enable react fast refreshing, and start another server to enable data fetching plus WebRTC peer connection establishment related signaling;
```
$ npm start
```

## For production:

To make use of any WebRTC features, you need a reverse proxy (eg: nginx) for the express server in this demo that enables HTTPS and a TURN server to establish each peer connection. 

That sounds complicated! 

Luckily, if you know how to use docker, everything will be easier. Here are important steps to deploy the project.

**Important Step 1**: make sure the nginx configuration file in your production environment maintains a consistent configuration with the information in this project's "docker-compose.yml" file;

**Important Step 2**: make sure the COTURN configuration file in your production environment also maintains a consistent 
configuration with the information in this project's "docker-compose.yml" file;
```
#
# Note: If the default realm is not specified, then realm falls back to the host domain name.
#       If the domain name string is empty, or set to '(None)', then it is initialized as an empty string.
#
realm=81.68.228.106:3478

# Enable verbose logging
verbose

# Enable long-term credential mechanism
lt-cred-mech

fingerprint

# Turn OFF the CLI support.
# By default it is always ON.
# See also options cli-ip and cli-port.
#
no-cli

# Log file path
log-file=/var/log/turnserver/turn.log

# Enable full ISO-8601 timestamp in all logs.
new-log-timestamp

# This flag means that no log file rollover will be used, and the log file
# name will be constructed as-is, without PID and date appendage.
# This option can be used, for example, together with the logrotate tool.
#
simple-log

# Specify the user for the TURN authentification
user=mingdongshensen:12345
```
**Important Step 3**: clone this project into your production environment, and move into it;
```
$ git clone https://github.com/myan0020/webrtc-group-chat-demo.git
$ cd webrtc-group-chat-demo
```

**Important Step 4**: build a docker image for this project;
```
$ docker build -t webrtc-group-chat-demo .
```
**Important Step 5**: use docker compose to run a multi-container app in detached mode;
```
docker compose -f docker-compose.yml up -d
```

## Authors
MingDongShenSen