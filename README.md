# webrtc-group-chat-demo

A web application to realize P2P features including video calling, screen sharing, text messaging and file transceiving with low lantency

## Prerequisites:

* avaliable TURN server urls

## For development:

Step 1. clone this project into your local machine and move into it;
```
$ git clone https://github.com/myan0020/webrtc-group-chat-demo.git
$ cd webrtc-group-chat-demo
```
Step 2. start a webpack dev server to serve web pages and enable react fast refreshing;
```
$ npm run dev
```
Step 3. start another server to enable data fetching and WebRTC peer connection establishment related signaling;
```
$ npm run express
```
Alternative (warning! not recommended, because node console does not use colors, which is less readable, and also, the script behind this command is unstable right now), 
```
$ npm start
```

## For production:

Step 1. clone this project into your cloud directory and move into it;
```
$ git clone https://github.com/myan0020/webrtc-group-chat-demo.git
$ cd webrtc-group-chat-demo
```
Step 2. use webpack compiling to create a directory named "build" which is directly under the project root directory (*** if you fail at this step, please run webpack compiling locally and then upload the generated "build" directory directly under the project root directory in the cloud);
```
$ npm run build
```
Step 3. start a server to serve this "build" directory as well as to enable API data fetching and WebRTC peer connection establishment related signaling;
```
$ npm run express
```

## Authors
MingDongShenSen