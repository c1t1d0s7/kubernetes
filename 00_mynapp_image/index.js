const http = require('http');
const os = require('os');
const ip = require('ip');
const dns = require("dns");

console.log(Date());
console.log("...Start My Node.js Application...");

var handler = function(request, response) {
    console.log(Date());
    console.log("Received Request From " + request.connection.remoteAddress);
    response.writeHead(200);
    response.write("Message: " + process.argv[2] + "\n");
    response.write("Hostname: " + os.hostname() + "\n");
    response.write("Platform: " + os.platform() + "\n");
    response.write("Uptime: " + os.uptime() + "\n");
    response.write("IP: " + ip.address() + "\n");
    response.write("DNS: " + dns.getServers() + "\n");
    response.end();
};

var www = http.createServer(handler);
www.listen(8080);
