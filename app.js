const { response } = require('express');
const express = require('express');
const res = require('express/lib/response');
const app = express();
app.use(express.static('client'));
app.use(express.json());
const { readdir, readdirSync } = require('fs');
const fs = require('fs');


//GET Methods
app.get('/home', function(req, resp){
    allfiles = readdirSync("./client/videos/Movies").concat(readdirSync("./client/videos/Series")).concat(readdirSync("./client/videos/Clips"));
    resp.json(allfiles)
});

app.get('/movies', function(req, resp){
    resp.json(
    readdirSync("./client/videos/Movies", { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    )
});

app.get('/series', function(req, resp){
    resp.json(
        readdirSync("./client/videos/Series", { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        )
});

app.get('/clips', function(req, resp){
    resp.json(
        readdirSync("./client/videos/Clips", { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
    )
});

app.get('/recents', function(req, resp){
    let recentsJSON = fs.readFileSync('./client/assets/recentlywatched.json');
    let responseJSON = JSON.parse(recentsJSON);
    resp.json(responseJSON.reverse());
});

app.post('/recents/new', function(req, resp){
    const new_recent = req.body;
    fs.readFile('./client/assets/recentlywatched.json', function(err, data) {
        if (err)
            throw err;
        var content = JSON.parse(data);
        for(var i in content){
            if(content[i].url.split("/")[1] == new_recent.url.split("/")[1]){
                content.splice(i,1)
                break;
            }
        }
        content.push(new_recent)

        fs.writeFileSync('./client/assets/recentlywatched.json', JSON.stringify(content), function(err) {
            if (err)
                throw err;
        });
    });
    resp.json(null);
});

app.post('/recents/load', function(req, resp){
    const recent_to_load = req.body.id;
    let recentJSON = {};
    data = fs.readFileSync('./client/assets/recentlywatched.json');
    var content = JSON.parse(data);
    for(var i in content){
        if(content[i].id == recent_to_load){
            recentJSON = content[i];
        }
    }
    resp.json(recentJSON);
});

app.post('/recents/remove', function(req, resp){
    const recent_to_remove = req.body.id;
    fs.readFile('./client/assets/recentlywatched.json', function(err, data) {
        if (err)
            throw err;
        var content = JSON.parse(data);
        for(var i in content){
            if(content[i].id == recent_to_remove){
                content.splice(i,1)
                break;
            }
        }
        fs.writeFileSync('./client/assets/recentlywatched.json', JSON.stringify(content), function(err) {
            if (err)
                throw err;
        });
    });
    resp.json(null);
});


// Make Sure THIS Stays Below Everything 
app.get('/:folderName/:subfolderName', function(req, resp){
    readdir("./client/videos/"+req.params.folderName.charAt(0).toUpperCase() + req.params.folderName.slice(1)+"/"+req.params.subfolderName, (err, files) => {
        if (err) {throw err};
        let return_files = []
        for (file in files){
            if (files[file].includes(".mp4") || files[file].includes(".mkv") && !files[file].startsWith(".")){
                return_files.push(files[file])
            }
        };
        resp.json(return_files.sort())
    })
});


module.exports = app;