var express = require("express");

var app = express();
app.use(express.bodyParser());
app.use(express.logger());

// Configuration

app.configure(function() {
    app.set('views', __dirname + '/app');
    //app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/app'));
    app.use(app.router);
    app.engine('html', require('ejs').renderFile);
});

var Datastore = require('nedb'),
    db = new Datastore({
        filename: './answers.db',
        autoload: true
    });

app.get('/', function(request, response) {
    response.render('index.html')
});
app.get('/results', function(request, response) {
    response.render('results.html');
});
app.post('/data', function(req, res) {
    db.insert(req.body.data, function(err, newDoc) {
        res.send(200);
    });
});
app.get('/data/results', function(request, response) {
    db.find({}, function(err, docs) {
        response.send(docs);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});