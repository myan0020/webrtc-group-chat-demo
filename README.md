# webrtc-group-chat-demo

A web application to realize P2P features including video calling, screen sharing, text messaging and file transceiving with low lantency

![alt text](https://github.com/myan0020/webrtc-group-chat-demo/blob/master/screenshots/chat_text.png?raw=true)

![alt text](https://github.com/myan0020/webrtc-group-chat-demo/blob/master/screenshots/chat_file.png?raw=true)

## Prerequisites:

avaliable TURN server urls

## For development:

**Step 1**: clone this project into your local machine, move into it and install all dependencies;
```
$ git clone https://github.com/myan0020/webrtc-group-chat-demo.git
$ cd webrtc-group-chat-demo
$ npm install
```

**Step 2**: start a webpack dev server to serve web pages and enable react fast refreshing;
```
$ npm run dev
```
**Step 3**: start another server to enable data fetching and WebRTC peer connection establishment related signaling;
```
$ npm run express
```

*Alternative (warning! not recommended, because node console does not use colors, which is less readable, and also, the script behind this command is unstable right now)*
```
$ npm start
```

## For production:

**Step 1**: clone this project into your cloud directory, move into it and install all dependencies;
```
$ git clone https://github.com/myan0020/webrtc-group-chat-demo.git
$ cd webrtc-group-chat-demo
$ npm install
```
**Step 2**: use webpack compiling to update the directory named "build" which is directly under the project root directory

*( If you fail at this step, please try to compile inside your local machine and then upload the generated "build" directory directly under the project root directory in your cloud environment );*

```
$ npm run build
```
**Step 3**: start a server to serve this "build" directory as well as to enable API data fetching and WebRTC peer connection establishment related signaling;
```
$ npm run express
```

## Authors
MingDongShenSen