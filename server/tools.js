exports.checkUrlExists = function (Url, callback) {
        var http = require('http'),
            url = require('url');
        var options = {
            method: 'HEAD',
            host: url.parse(Url).host,
            port: 80,
            path: url.parse(Url).pathname
        };
        var req = http.request(options, function (r) {
            callback( r.statusCode== 200);});
        req.end();
    }

exports.checkUrlExists2 = function(host,cb) {
    var http = require('http');
    http.request({method:'HEAD',host,port:80,path: '/'}, (r) => {
        cb(null, r.statusCode > 200 && r.statusCode < 400 );
    }).on('error', cb).end();
}