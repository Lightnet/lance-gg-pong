'use strict';

import express from 'express';
import socketIO from 'socket.io';
import path from 'path';

const PORT = process.env.PORT || 8080;
const INDEX = path.join(__dirname, '../index.html');

// define routes and socket
const server = express();
server.get('/', function(req, res) { res.sendFile(INDEX); });
//server.use('/', express.static(path.join(__dirname, '.')));
server.use('/', express.static(path.join(__dirname, '../public')));
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

// Game Server
import MyServerEngine from './src/server/MyServerEngine';
import MyGameEngine from './src/common/MyGameEngine';
//import Trace from '../../lance/lib/Trace';
import Trace from 'lance/lib/Trace';
//Trace.TRACE_NONE
//
var TRACE = Trace.TRACE_DEBUG
// Game Instances
const gameEngine = new MyGameEngine({ traceLevel: TRACE });
const serverEngine = new MyServerEngine(io, gameEngine, { debug: {}, updateRate: 6, tracesPath: './logs' });

// start the game
serverEngine.start();
