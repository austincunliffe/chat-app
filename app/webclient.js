const ws = new WebSocket("ws://" + location.host);
    ws.onopen = function (event) {
        console.log("Connection established.");
    };

    ws.onerror = function (event) {
        console.log("Error.");
    }

document.getElementById("loginButton").onclick = function(){
    let roomName = "join " + document.getElementById("chatroom").value;    

    let request = new XMLHttpRequest();
    request.open("GET", "resources/chatpage.html");
    request.send();
    let username = document.getElementById("username").value;

    request.onload = function () {
        document.body.innerHTML = request.response;
        document.getElementById("submitMessage").onclick = function(){
            let message = username + " " + document.getElementById("message").value;
            document.getElementById("message").value = "";
            ws.send(message);
        }
        ws.onmessage = function(event){
            let messageDiv = document.createElement("div");

            messageDiv.align = "left";
            let serverMessage = JSON.parse(event.data);
            let lineOutput = document.createTextNode(serverMessage.user + ": " + serverMessage.message);
            messageDiv.appendChild(lineOutput);
            document.getElementById("textHistory").appendChild(messageDiv);
        }
        ws.send(roomName);
    }
}


