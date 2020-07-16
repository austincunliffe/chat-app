var http = require('http');
var fs = require('fs');
var mime = require('mime-types');

var WebSocketServer = require('websocket').server;

let rooms = {};

let server = http.createServer(function (request, response) {

    let filepath = request.url;
    if (filepath === '/') {
        filepath = 'index.html'
    } else { filepath = request.url.slice(1) }

    console.log("File requested: " + filepath);

    fs.readFile(filepath, function (error, content) {
        if (error) {
            response.writeHead(404);
        } else {
            response.writeHead(200, { 'Content-Type': mime.lookup(filepath) });
            response.end(content)
        }
    });
});

wsServer = new WebSocketServer({
    httpServer: server,
});

wsServer.on('request', function (request) {
    var connection = request.accept(null, request.origin);
    connection.on('message', function (message) {
        console.log("Received Message: " + message.utf8Data)

        var messageArray = message.utf8Data.split(" ");
        let roomName = messageArray[1];

        if (messageArray[0] == "join") {
            if (messageArray[1] in rooms) {
                rooms[messageArray[1]].users.push(connection);

                rooms[roomName].messageHistory.forEach(element => {
                    connection.send(JSON.stringify(element))
                });
            } else {
                console.log("New room.")
                let aroom = {
                    users: [connection],
                    messageHistory: []
                }
                rooms[messageArray[1]] = aroom;
            }
            connection.removeAllListeners();
            connection.on('message', function (message) {
                var index = message.utf8Data.indexOf(" ")
                var username = message.utf8Data.substr(0, index);
                var userMessage = message.utf8Data.substr(index + 1);

                var messageAsJSON = {
                    "user" : username,
                    "message" : userMessage
                }
                rooms[roomName].messageHistory.push(messageAsJSON);

                rooms[roomName].users.forEach(element => {
                    element.send(JSON.stringify(messageAsJSON));
                });
            });
        } else {
            connection.close
        }
    })
})

server.listen(8080);