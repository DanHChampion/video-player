let fileList = document.getElementById("file-list");
let videoInfo = document.getElementById("video-info");
let videoTitle = document.getElementById("video-title");
let videoPlayer = document.getElementById("video-player");
let navBar = document.getElementById("navbar");
let mainBody = document.getElementById("main-body");
let video = document.getElementById("video");
let nextButton = document.getElementById("next-button");
let episodesButton = document.getElementById("episodes-button")
let selectedFolder = document.getElementById("folder-selector");
let currentPath = document.getElementById("current-path");
let vOptions = document.getElementById("voptions");
let vOptionsBtn = document.getElementById("video-options");
let addTime = document.getElementById("next10");
let subTime = document.getElementById("back10");
let pauseSection = document.getElementById("pause");
let onlineSearchBar = document.getElementById("url-bar");
let notes = document.getElementById("notes");
let webpageFrame = document.getElementById("webpage_iframe");
let currentIndex = null;
let currentSelected = null;
let currentselected = null;
let currentpath = null;
let path = null;
var currentFiles = [];
let files = [];
let auto = false;
let fullscreenToggle = false;
let voptionstoggle = false;
let pause = false;

let videoWrapper = document.getElementById("body-left")
let fileExplorer = document.getElementById("body-right")

let playerWatching = false;

// First Load
window.addEventListener('load', (event) => {
    // Hide Elements
    vOptions.classList.add("hidden");
    videoInfo.classList.add("hidden");

    videoWrapper.classList.add("hidden");
    navBar.classList.remove("hidden");   
    mainBody.style.height = "94vh";

    fileList.innerHTML = "<p>No Folder Selected</p>";
    videoPlayer.innerHTML = "<p>No Video Selected</p>";
    nextButton.classList.add("hidden")


    // Start in Home Folder
    selectFolder("home")
});

// Check When Clicked Outside Element
document.addEventListener('click', function(event) {
    var isClickInsideMenu = vOptions.contains(event.target);
    var isClickInsideButton = vOptionsBtn.contains(event.target);

    if (!isClickInsideButton && !isClickInsideMenu) {
        voptionstoggle = true;
        toggleOptions();
    }
});

// Folder Selector
document.getElementById('home').onclick = function () {
    selectFolder("home")    
};
document.getElementById('movies').onclick = function () {
    selectFolder("movies")
};
document.getElementById('series').onclick = function () {
    selectFolder("series")
};
document.getElementById('clips').onclick = function () {
    selectFolder("clips")
};

// Get Home, Movies, Series, Clips
async function getFolder(folder){
    let response = await fetch("http://127.0.0.1:8000/"+folder);
    let foldersList = await response.json();
    foldersList = JSON.parse(JSON.stringify(foldersList));
    return foldersList
}

// Get "Continue Watching"
async function getRecents(){
    let response = await fetch("http://127.0.0.1:8000/recents");
    let recentList = await response.json();
    recentList = JSON.parse(JSON.stringify(recentList));
    return recentList
}

// Render Tabs 
async function renderFolder(folder, search = false, value = null){
    let folders = await getFolder(folder);
    let htmlString ="";
    if (folders.length == 0){
        htmlString = "<p>Empty Folder</p>"

    } else if (folder == "home"){ 
        // Load Home Page

        htmlString = "<span>Continue Watching</span>";
        let recents = await getRecents();
        if (recents.length == 0){
            htmlString = "<span>Start Watching Something!</span>";

        } else {
            for (let i = 0; i<recents.length; i++) {  
                htmlString += "<div id=\"file"+i+"\" class='file' onclick = \'loadRecent(\""+recents[i].id+"\")\'><img loading='lazy' src=\"./videos/"+recents[i].url.split("/")[0]+"/"+recents[i].url.split("/")[1]+"/coverphoto.jpg\" onerror=\"this.style.display='none'\" alt=\""+recents[i].id+"\"><span>"+recents[i].id+"</span></div> ";
            }
        // } if (recents.length > 9){
            
        // } else {
        //     for (let i = 0; i<recents.length; i++) {  
        //         htmlString += "<div id=\"file"+i+"\" class='file' onclick = 'loadRecent(\""+recents[i].id+"\")'><img loading='lazy' src=\"./videos/"+recents[i].url.split("/")[0]+"/"+recents[i].url.split("/")[1]+"/coverphoto.jpg\" onerror=\"this.style.display='none'\" alt=\""+recents[i].id+"\"><span>"+recents[i].id+"</span></div> ";
        //     }
        }
    
    } else{
        // <span>"+folders[i]+"</span>
        if (search){ 
            htmlString = "<span>Results for: \""+value+"\"</span>";
            for (i in folders) {  
                if (folders[i].toLowerCase().includes(value.toLowerCase())){
                        htmlString += "<div id='file"+i+"' class='file' onclick = selectSubFolder(\""+encodeURIComponent(folders[i])+"\")><img loading='lazy' src=\"./videos/"+path+"/"+encodeURIComponent(folders[i])+"/coverphoto.jpg\" onerror=\"this.style.display='none'\" alt='"+folders[i]+"'><span>"+folders[i]+"</span></div> ";
                }
            }
        } else { 
            for (i in folders) {  
            htmlString += "<div id='file"+i+"' class='file' onclick = selectSubFolder(\""+encodeURIComponent(folders[i])+"\")><img loading='lazy' src=\"./videos/"+path+"/"+encodeURIComponent(folders[i])+"/coverphoto.jpg\" loading='lazy' onerror=\"this.style.display='none'\" alt='"+folders[i]+"'><span>"+folders[i]+"</span></div> ";
            } 
        }
    }
    fileList.innerHTML = htmlString;
    files = null;

}

// Get Files Names inside Folder
async function getFiles(folder){
    let response = await fetch("http://127.0.0.1:8000/"+selectedFolder.value+"/"+folder);
    let filesList = await response.json();

    filesList = JSON.parse(JSON.stringify(filesList));
    return filesList
}

// Selecting a Sub-Folder
async function selectSubFolder(folderName){
    let fileslist = await getFiles(folderName);
    renderFiles(fileslist,folderName);
    if (currentFiles.length == 0){
        currentFiles = files;
    }
    path += "/"+ folderName;
}

// // Select a Continue Watching Movie/Series/Clip
// async function selectRecent(recentURL){
//     let response = await fetch("http://127.0.0.1:8000/"+recentURL);
//     let fileslist = await response.json();

//     fileslist = JSON.parse(JSON.stringify(fileslist));
//     path = recentURL;

//     renderFiles(fileslist,recentURL.split("/")[1]);
//     if (currentFiles.length == 0){
//         currentFiles = files;
//     }
// }

// Go Back to Previous Folder
function goBack(){
    fileList.classList.remove("hidden");
    videoInfo.classList.add("hidden");
    path = path.split("/")[0];
    renderFolder(path);
}

// Rendering Files
function renderFiles(fileslist,folderName){
    let listLength = fileslist.length;
    let htmlString = "";
    fileList.classList.add("hidden");
    videoInfo.classList.remove("hidden");
    htmlString += "<img class='background-picture' src=\"./videos/"+path+"/"+folderName+"/coverphoto.jpg\" alt='coverphoto.jpg'/> ";
    htmlString += "<div id='back' onclick = goBack()> <i> < Back </i> </div>";

    if (listLength == 0){
        htmlString += "<span>Empty Folder</span>"
    }
    else{
        // Movies
        if (path.split("/")[0] == "movies" ){
            htmlString += "<img class='coverphoto' loading='lazy' src=\"./videos/"+path+"/"+folderName+"/coverphoto.jpg\" alt='coverphoto.jpg'> <span><strong> "+ decodeURI(folderName) +"</strong></span> <button class='center' onclick='selectFile(0, movie = true)'> <img id='play' class='icon' src='./assets/play.png'/> Play </button> <a href=\"https://www.google.co.uk/search?q="+decodeURI(folderName)+"\" target='_blank' > <button class='center'> More info </button></a> "
        }
        // Series & Clips
        else {
            htmlString += "<img class='coverphoto' loading='lazy' src=\"./videos/"+path+"/"+folderName+"/coverphoto.jpg\" alt='coverphoto.jpg'> <span><strong> "+ decodeURI(folderName) +"</strong></span>"
            for (let i = 0; i < listLength; i++) {
                if (fileslist[i].includes(".mp4") || fileslist[i].includes(".mkv")){
                    htmlString += "<div id=\"file"+encodeURIComponent(fileslist[i])+"\" class='episode' onclick=\"selectFile(index="+i+")\" >"+fileslist[i].split(".mp4")[0].split(".mkv")[0]+"</div>"
                }
            }
        }
        // Clips

    }
    videoInfo.innerHTML = htmlString;
    files = fileslist;
}

// Get Video from "videos" Directory
function getVideo(videoName,index){
    return "<video id='video' width='100%' height='100%' frameborder='0' autoplay preload='auto' onended='videoEnded()'><source src=\"./videos/"+currentpath+"/"+videoName+"\" type=\"video/mp4\" />"
}

// Get Subtitles from "videos" Directory
function getSubtitles(index){
    return "<track label='English' kind='subtitles' srclang='en' src=\"./videos/"+currentpath+"/english"+index+".vtt\"></track>"
}

// Select File (Play Video)
function selectFile(index, movie=false){
    try{
        currentIndex = index;
            if (auto){
                console.log("Continuing")
            }
            else{
                currentpath = path;
                currentFiles = files;
            }
            auto = false;
        if (movie){
            for (let i = 0; i<files.length; i++){
                if (files[i].includes(".mp4") || files[i].includes(".mkv")){
                    index = i
                }
            }
        }

        currentFiles = files;

        let fileName = currentFiles[index];

        let htmlString ="";
        currentselected = "file"+encodeURIComponent(currentFiles[index]);
        if(fileName.includes(".mp4")|| fileName.includes(".mkv")){
            let videoName = currentFiles[index]    
            
            htmlString = getVideo(videoName,index);
            videoName = videoName.split(".mp4")[0].split(".mkv")[0];  
            htmlString += getSubtitles(index)
            try{
            videoPlayer.innerHTML = htmlString +"</video>";
            console.log(videoPlayer.innerHTML)
            video = document.getElementById("video");
            playerWatching = true;
            webpageFrame = null;

            videoTitle.innerHTML = videoName;
            videoWrapper.classList.remove("hidden");
            fileExplorer.classList.add("hidden");
            videoInfo.classList.add("hidden");
            navBar.classList.add("hidden");   
            mainBody.style.height = "100vh"
            slider.max = video.duration
            slider.value = video.currentTime
            video.volume = tempVolume

            nextEpisode.style.height = 0+"px"
            nextEpisode.style.display= "none"
            episodesPopup.style.height = 0+"px"
            episodesPopup.style.display= "none"
            pauseButton.innerHTML = "<img src='./assets/pause.png'/>"
            document.getElementById("subs-button").style.color = "#EEE"
            
            // timer.classList.add("hidden");

            if (currentFiles.length == 1){
                nextButton.classList.add("hidden")
            }
            else if (currentIndex == 0){
                nextButton.classList.remove("hidden")
            }
            else if (currentIndex == currentFiles.length-1){
                nextButton.classList.add("hidden")
            }
            else{
                nextButton.classList.remove("hidden")
            }
            
            if (currentFiles.length > 1){
                episodesButton.classList.remove("hidden")
            } else{
                episodesButton.classList.add("hidden")
            }
        }catch (err){
            console.log(err)
        }
            
        }
        else{
            htmlString = "<p>Not a valid video file</p>"
            videoPlayer.innerHTML = htmlString;
            videoTitle.innerHTML = fileName;
            nextButton.classList.add("hidden")
        }
        // if (currentpath == path){
        //     for (let i = 0; i<currentFiles.length; i++){
        //         currentSelected = document.getElementById("file"+encodeURIComponent(currentFiles[i]));
        //         if (currentselected == "file"+encodeURIComponent(currentFiles[i])){
        //             currentSelected.classList.add("active");
        //         }
        //         else {
        //             currentSelected.classList.remove("active");
        //         }
        //     }
        // }
    }
    catch(e){
        nextButton.classList.add("hidden")
        console.log(e);

    }
}

// Toggle Video Options
function toggleOptions(){
    if (voptionstoggle == true){
        voptionstoggle = false;
        vOptions.classList.add("hidden");
    }
    else{
        voptionstoggle = true;
        vOptions.classList.remove("hidden");
    }
}

// If String is URL
function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};

// Search File
function searchFile(){ 
    searchvalue = onlineSearchBar.value;

    // Input is not URL
    if (searchvalue != ""){
        // Search in Database
        folder = selectedFolder.value

        renderFolder(folder,search = true, value = searchvalue);
        path = path.split("/")[0];

        onlineSearchBar.value = "";
    }

    
}

// Get Link from Webpage
function getLink(){
    let link = webpageFrame.src;
    navigator.clipboard.writeText(link);
    toggleOptions();
    return(link)
}

async function updateRecents(){
    if (nextButton.classList.contains("hidden") && (video.currentTime/video.duration ) > 0.95 ){
        // MAKE THIS WORK
        console.log("Removed")
        let parameters = {id:videoTitle.innerHTML.replaceAll("'","")};
        let response = await fetch('http://127.0.0.1:8000/recents/remove', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameters)
    });
    }else{
    let parameters = {};
    let split = currentFiles[currentIndex].split(".")
    let type = split[split.length-1]
    parameters = {
        "id":videoTitle.innerHTML.replaceAll("'",""),
        "url": currentpath+"/"+encodeURIComponent(videoTitle.innerHTML)+"."+type,
        "watchtime": video.currentTime,
        "index":currentIndex,
    };

    let response = await fetch('http://127.0.0.1:8000/recents/new', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(parameters)
            });

    }
}

async function loadRecent(id){
    let parameters = {id:id};
    let response = await fetch('http://127.0.0.1:8000/recents/load', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameters)
    });
    let recent_obj = await response.json();
    recent_obj = JSON.parse(JSON.stringify(recent_obj));
    let split_path = recent_obj.url.split("/")
    path = split_path[0]+"/"+split_path[1]
    currentpath = split_path[0]+"/"+split_path[1]
    index = recent_obj.index;
    currentIndex = index;
    let response2 = await fetch("http://127.0.0.1:8000/"+currentpath);
    let filesList = await response2.json();
    filesList = JSON.parse(JSON.stringify(filesList));

    files = filesList
    currentFiles = filesList;

    let videoName = decodeURIComponent(split_path[2]);            
    htmlString = getVideo(videoName,index);
    htmlString += getSubtitles(index)
    try{
        videoPlayer.innerHTML = htmlString +"</video>";
        console.log(videoPlayer.innerHTML)
        video = document.getElementById("video");
    playerWatching = true;

    webpageFrame = null;


    video.currentTime = recent_obj.watchtime;
    videoTitle.innerHTML = videoName.split(".mp4")[0].split(".mkv")[0];
    pauseButton.innerHTML = "<img alt='pause.png' src='./assets/pause.png'/>"


    videoWrapper.classList.remove("hidden");
    fileExplorer.classList.add("hidden");
    
    navBar.classList.add("hidden");   
    mainBody.style.height = "100vh"
    slider.max = video.duration
    slider.value = video.currentTime
    video.volume = tempVolume
    document.getElementById("subs-button").style.color = "#EEE"

    showControls(5000)


    if (currentFiles.length == 1){
        nextButton.classList.add("hidden")
    }
    else if (currentIndex == 0){
        nextButton.classList.remove("hidden")
    }
    else if (currentIndex == currentFiles.length-1){
        nextButton.classList.add("hidden")
    }
    else{
        nextButton.classList.remove("hidden")
    }
    if (currentFiles.length > 1){
        episodesButton.classList.remove("hidden")
    } else{
        episodesButton.classList.add("hidden")
    }
    } catch (err){
        console.log(err)
    }
    
    }