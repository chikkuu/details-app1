var http = require('http'),
inspect = require('util').inspect,
f = require('fs'), 
Busboy = require('../busboy'),
/*gpio = require('../onoff').Gpio,*/
append, name, tempHTML;

/***********************************************************
// Acknowledge me by blinking an LED on my RPi when someone access this page
function blink(){
led = new gpio(17, 'out');
var iv = setInterval(function () {
  led.writeSync(led.readSync()^1);
}, 200);
setTimeout(function () {
  clearInterval(iv); 
  led.writeSync(0);
  led.unexport();
}, 10000);
}
********************************************************/


f.readFile('chat.html',function(err,html){
	tempHTML = html;
	http.createServer(function(req, res) {
		if (req.method === 'POST') {
			var busboy = new Busboy({ headers: req.headers });
			busboy.on('field', function(fieldname, val) {
				append = inspect(val);
				if(fieldname !== 'txt')
					console.log( fieldname +'='+ append);
				if(fieldname === 'name')
					name = append;
				if(fieldname === 'msg'){
					f.readFile('chat.html', 'utf8', function (err,data) {
					if (err) throw err;
						var result = data.replace(/--END OF CHAT--/g, name+'\t:\t'+append+'\n --END OF CHAT--');
					f.writeFile('chat.html', result, 'utf8', function(err){
						if (err) throw err;});
					f.readFile('chat.html', 'utf8', function (err,html) {
						if (err) throw err;
						tempHTML = html;
					});
					});
				}
			});
			busboy.on('finish', function() {
				console.log('-----------Done parsing msg!!!-------------');
				/*blink();*/
				res.writeHead(303, { Connection: 'close', Location: '/' });
				res.end();
			});
			req.pipe(busboy);
		}
		else if (req.method === 'GET') {
			res.writeHead(200, { Connection: 'close' });
			res.write(tempHTML);
			res.end();
		}

}).listen(8000);
});
