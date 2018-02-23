var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var config     = require('./config');
var path       = require('path');
var cors       = require('cors');

mongoose.Promise = require('bluebird');

var corOptions = {
   origin: 'http://localhost:9000',
   methods: 'GET, POST, PUT, DELETE, OPTIONS',
   allowedHeaders: 'X-Requested-With,content-type,Authorization,Origin,Accept,X-Access-Token,x-id',
   credentials: true,
   maxAge: 300,
   preflightContinue: false
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(corOptions));

app.use(morgan('dev'));

mongoose.connect(config.database, {useMongoClient: true});

app.use(express.static(__dirname + '/public'));

var apiRoutes  = require('./app/routes/api')(app, express);
var routesVideo = require('./app/routes/video')(app, express);
//REGISTER ROUTES
app.use('/api', routesVideo);
app.use('/api', apiRoutes);


app.get('*', function(req, res) {
   //res.send('Welcome to the home page');
   res.sendFile(path.join(__dirname + '/public/app/index.html'));
});

app.listen(config.port);
console.log('Magic happens on port ' + config.port);
