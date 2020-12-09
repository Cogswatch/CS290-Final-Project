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

app.use(express.static('public'));

function register_get_request(name)
{
    app.get('/' + name, function (req, res) {
        res.sendFile(path.join(__dirname, '', name));
    });
}

register_get_request("style.css");
register_get_request("godotStyle.css");

register_get_request("public/devs/zack.jpeg");
register_get_request("public/devs/brady.jpeg");
register_get_request("public/devs/cameron.jpeg");

app.get('/scores', function (req, res, next) {
    var leaderboard_data = require('./public/data/leaderboard.json');
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

app.get('/about', function (req, res, next) {
    var context = {
        title: 'About',
    };
    res.render('about', context);
});


let homepage = function (req, res, next) {
    var context = {
        title: 'Home Page',
    };
    res.render('home', context);
}

app.get('/index.html', homepage);
app.get('/', homepage);

app.get('/contact', function (req, res, next) {
    var context = {
        title: 'Contact',
        devs: require("./public/data/devs.json")
    };
    res.render('contact', context);
});

app.get('/play', function (req, res, next) {
    var context = {
        title: 'Play',
    };
    res.render('godotplay', context);
});

app.get('*', function (req, res) {
    var context = {
        title: '404',
        path: req.path
    };
    res.status(404).render('404', context);
});

var file_data = require('./public/data/leaderboard.json');
app.post('/play', function (req, res) {
    console.log(" === post request: ", req.body.score);
    var data =  (req.body);
    console.log('file data: ', file_data)
    file_data.push(data);

    fs.writeFileSync('./data/leaderboard.json', JSON.stringify(file_data, null, 2));

    res.send();
});

app.listen(port, function () {
  console.log("== Server is listening on port", port);
});
