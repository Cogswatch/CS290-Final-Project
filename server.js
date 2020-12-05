//////////////////////////////////////////////////////////////////////
//  server.js
//
//////////////////////////////////////////////////////////////////////

var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var app = express();
var port = process.env.PORT || 8888;

app.use(express.json());
app.engine('handlebars', exphbs({defaultLayout: "main"}));
app.set('view engine', 'handlebars');

const fs = require('fs');


//app.use(express.static('public'));

function register_get_request(name)
{
    app.get('/' + name, function (req, res) {
        res.sendFile(path.join(__dirname, '', name));
    });
}

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '', 'index.html'));
});

register_get_request("index.html");
//register_get_request("play.html");
//register_get_request("scores.html");
register_get_request("about.html");
register_get_request("contact.html");
register_get_request("style.css");
register_get_request("Game.js");
register_get_request("ModalControl.js");
register_get_request("main.js");
register_get_request("StartScreen.js");
register_get_request("ObjectPool.js"); 

app.get('/scores.html', function (req, res, next) {
    var leaderboard_data = require('./data/leaderboard.json');
    leaderboard_data.sort((a, b) => (a.score < b.score) ? 1 : -1)

    var i = 1;
    leaderboard_data.forEach(function(ele){
        ele.index = i++;
    });

    var context = {
        title: 'Scores',
        scores: leaderboard_data
    };
    res.render('scores', context);
});

app.get('/play.html', function (req, res, next) {
    var context = {
        title: 'Play',
    };
    res.render('play', context);
});

app.get('/lib/phaser.min.js', function (req, res) {
    res.sendFile(path.join(__dirname, 'lib', 'phaser.min.js'));
});

app.get('/assets/:sub_dir/:game_asset', function (req, res) {
    res.sendFile(path.join(__dirname, 'assets/' + req.params.sub_dir, req.params.game_asset));
});

app.get('/assets/:game_asset', function (req, res) {
    res.sendFile(path.join(__dirname, 'assets', req.params.game_asset));
});

app.get('*', function (req, res) {
    res.status(404).sendFile(path.join(__dirname, '', '404.html'));
});

var file_data = require('./data/leaderboard.json');

app.post('/play.html', function (req, res) {
    console.log(" === post request: ", req.body.score);
    var data =  (req.body);
    console.log('file data: ', file_data)
    file_data.push(data);


    fs.writeFileSync('./data/leaderboard.json', JSON.stringify(file_data, null, 2));

    //fs.appendFile('data/leaderboard.txt', data.name + '::' + data.score + '\n', function (err) {
     //   if (err) throw err;
     //   console.log('Saved!');
    //});
    
    res.send();
});

app.listen(port, function () {
  console.log("== Server is listening on port", port);
});
