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

app.get('/scores', function (req, res, next) {
    var leaderboard_data = require('./public/data/leaderboard.json');
    leaderboard_data.sort((a, b) => (a.score < b.score) ? 1 : -1)

    var i = 1;
    leaderboard_data.forEach(function(ele){
        ele.index = i++;
    });

    var context = {
        title: 'Scores',
        scores: leaderboard_data,
        linkUsers: true
    };
    res.render('scores', context);
});

app.get('/scores/u/:username', function (req, res, next) {
    var leaderboard_data = require('./public/data/leaderboard.json');

    var userboard_data = leaderboard_data.filter(function(item) {
        return item.name == req.params.username;
    })

    leaderboard_data.sort((a, b) => (a.score < b.score) ? 1 : -1)

    var i = 1;
    leaderboard_data.forEach(function(ele){
        ele.index = i++;
    });

    var context = {
        title: req.params.username + `'s Scores`,
        scores: leaderboard_data,
        linkUsers: false
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
        gallery: require("./public/data/gallery.json")
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
