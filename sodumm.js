var request = require('request');
var fs = require('fs');

var users = [];

function post(url, name, id, cookie) {
    // Set the headers
    var headers = {
    	'Content-Length':   '119',
    	'Content-Type':     'application/x-www-form-urlencoded',
    	'Cookie':           'JSESSIONID=' + cookie,
    };

    // Configure the request
    var options = {
        'url': url,
        'method': 'POST',
        'headers': headers,
        'form': {
            'confirm': 'true',
            'veranstaltung_nr': '080154',
            'gruppe_nr': '7',
            'session_id': id
        },
    };

    // Start the request
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    request(options, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            // Print out the response body
            var found = body.match('<status>.*<\/status>');
            found = (found && found.length > 0) ? found[0].replace(/<[^>]*>/g, '') : '';
            console.log('[' + new Date().toLocaleTimeString() + '] ' + name + ': ' + response.statusCode, found);
        }
    });
}

function read(file) {
    fs.readFile(file, "utf8", (err, data) => {
        if (err){
            console.log(err);
            return;
        }
        try {
            users = JSON.parse(data);
        } catch(e) {
            console.log(e);
        }
    });
}

function init() {
    var file = __dirname + '/users.txt';
    fs.watchFile(file, (curr, prev) => {
        read(file);
    });
    read(file);
    loop();
}

function loop() {
    var url = 'https://sodom.informatik.uni-kiel.de:8484/studierende/module';
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        post(url, user.name, user.id, user.cookie);
    }
    setTimeout(loop, 1000);
}

init();
