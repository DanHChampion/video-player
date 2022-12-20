// Shortcuts
document.addEventListener("keydown", function(event) {
    // Enter on URL 
    console.log(event.key)
    if (onlineSearchBar === document.activeElement){
        if (event.key == 'Enter') {
            searchFile();
        }
    } else {
        // Full Screen Toggle
        if (event.key == 'f') {
            toggleFullscreen()
        } // Go Back 10s
        else if (event.key == 'j' || event.key === 'ArrowLeft') {
            sub10();
        } // Pause
        else if (event.key == 'k' || event.key == ' ' ) {
            pauseVideo()
        } // Go Forward 10s
        else if (event.key == 'l' || event.key === 'ArrowRight') {
            add10();
        }
        else if (event.key == 'm'){
            toggleMute()
        }
        else if (event.key == 'i'){
            minimize()
        }
        else if (event.key == 'Escape'){
            closePlayer()
        }
        
    }
});

pauseButton = document.getElementById("pause-button")
// Control Video
function pauseVideo(){
    if (video != null){
        if(document.querySelector('video').playing){
            video.pause();
            pauseButton.innerHTML = "<img src='./assets/play.png'/>"
            showControls(3000)
        }
        else{
            video.play();
            pauseButton.innerHTML = "<img src='./assets/pause.png'/>"
            showControls(1000)
        }
    }
}
function add10(){
    if (video != null){
        video.currentTime += 10;
    }
}
function sub10(){
    if (video != null){
        video.currentTime -= 10;
    
    }
}

// Switch Between Files (Next Episode)
function nextFile(){
    console.log("next")
    currentIndex += 1;
    auto = true;
    selectFile(currentIndex);
    showControls(2000)
}

// When Video Ends Move to Next Episode
async function videoEnded(){
    // function startTimer() {
    //     let seconds = 5;
    //     timer.classList.remove("hidden");

    //     function updateTimer(seconds){
    //         timer.innerHTML = "<p>"+seconds+" Next Episode</p>"
    //     }
    //     return setInterval(function() {
    //         updateTimer(seconds);
    //         seconds -= 1;
    //         if (seconds < 0) {
    //             clearInterval();
    //             timer.innerHTML = "<p>0</p>";
    //         }
    //     }, 1000);
        
    
    // }
    function sleep(duration) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()                
            }, duration * 1000)
        })
    }
    if (currentIndex < currentFiles.length-1){
        tempIndex = currentIndex
        // startTimer();
        showEpisode()
        await sleep(5);
        hideEpisode()
        if (tempIndex == currentIndex){
            nextFile();
        }
    }
}

// Close Video Player
function closePlayer(){
    // Hide Elements
    updateRecents();
    playerWatching = false;

    vOptions.classList.add("hidden");
    fileExplorer.classList.remove("hidden");
    videoInfo.classList.add("hidden");
    videoWrapper.classList.add("hidden");
    navBar.classList.remove("hidden");   
    mainBody.style.height = "94vh";
    nextButton.classList.add("hidden");   

    if(document.fullscreenElement !== null){
        document.exitFullscreen();
    }

    selectFolder("home")
    videoPlayer.innerHTML = "<p>No Video Selected</p>";
}

let slider = document.getElementById('video-slider');
slider.value = 1;

const interval = setInterval(function() {
    if (playerWatching){
        updateSlider()
        updateRecents()
        updateTime()
    }
}, 1000);

slider.onclick = function () {
    video.currentTime =  slider.value
    updateSlider()
    updateTime()
}

let idleState = null;
let idleTimer = false;

document.addEventListener("mousemove", function(event) {
    if (playerWatching){
        showControls(2000)
    }
});

let disableControlHide = false

function showControls(time) {
    clearTimeout(idleTimer);
    video = document.getElementById("video")
    if (idleState== true){
        document.getElementById("top-toolbar").classList.remove("hidden")
        document.getElementById("bottom-toolbar").classList.remove("hidden")
        document.getElementById("back10").classList.remove("hidden")
        document.getElementById("pause-button").classList.remove("hidden")
        document.getElementById("next10").classList.remove("hidden")
        video.classList.add("darken");

        disableControlHide = false
        videoWrapper.style.cursor = "default"

    }
    if (!disableControlHide){
        idleState = false;
        idleTimer = setTimeout(function(){
            document.getElementById("top-toolbar").classList.add("hidden")
            document.getElementById("bottom-toolbar").classList.add("hidden")
            document.getElementById("back10").classList.add("hidden")
            document.getElementById("pause-button").classList.add("hidden")
            document.getElementById("next10").classList.add("hidden")
            video.classList.remove("darken");
            videoWrapper.style.cursor = "none"
            idleState = true;
            
        },time)
        }
    
}

// videoWrapper.addEventListener("mouseout", function(event) {
//     document.getElementById("bottom-toolbar").classList.add("hidden")
// });

function updateSlider(){
    slider.max = video.duration
    slider.value = video.currentTime
    slider.style.backgroundSize = (slider.value * 100)/ slider.max + "% 100%"
}

function toggleFullscreen(){
    if (playerWatching){
        if (document.fullscreenElement === null){
            videoWrapper.requestFullscreen();
            document.getElementById("fullscreen-button").innerHTML = "<img src='./assets/downsize.png'/>"
            fullscreenToggle = true;
        }
        else{
            document.exitFullscreen();
            document.getElementById("fullscreen-button").innerHTML = "<img src='./assets/upsize.png'/>"
            fullscreenToggle = false;
        }
    }
}

let subsOn = false;
function toggleSubtitles(){
    try{
        subsOn = !subsOn
        console.log(subsOn)
    
        if (subsOn){
            video.textTracks[0].mode = 'showing';
        } else{
            video.textTracks[0].mode = 'hidden';
        }
    } catch (e){
        console.log("bruh", e)
        document.getElementById("subs-button").style.color = "grey"
        toggleSubtitles()
    }
}

let watchtimeLabel = document.getElementById("watchtime-labels")
function updateTime(){
    watchtimeLabel.innerHTML = "<div id='current-time' >"+convertHMS(video.currentTime)+" </div>/<div id='time-left' >" +convertHMS(video.duration-video.currentTime)+"</div>"
}

function convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours   = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (hours == 0){
        return minutes+':'+seconds; // Return is MM : SS
    }
    return hours+':'+minutes+':'+seconds; // Return is HH : MM : SS
}

let tempVolume = 0.5
function toggleMute(){
    if (video.volume > 0.0){
        video.volume = 0.0
        document.getElementById("volume-button").innerHTML = "<img src='./assets/muted.png'/>"
    } else {
        if (tempVolume > 0.0){
            video.volume = tempVolume
        } else{
            video.volume = 1
        }
        if (video.volume > 0.35){
            document.getElementById("volume-button").innerHTML = "<img src='./assets/max_volume.png'/>"
        } else if (video.volume > 0.15){
            document.getElementById("volume-button").innerHTML = "<img src='./assets/volume2.png'/>"
        }else{
            document.getElementById("volume-button").innerHTML = "<img src='./assets/volume1.png'/>"
        }

    }
    volumeSlider.value = video.volume
    volumeSlider.style.backgroundSize = (volumeSlider.value * 100)/ volumeSlider.max + "% 100%"
}
let volumeSlider = document.getElementById("volume-slider")

function updateVolume(){
    video.volume =  volumeSlider.value
    volumeSlider.style.backgroundSize = (volumeSlider.value * 100)/ volumeSlider.max + "% 100%"
    if (video.volume > 0.35){
        document.getElementById("volume-button").innerHTML = "<img src='./assets/max_volume.png'/>"
    } else if (video.volume > 0.15){
        document.getElementById("volume-button").innerHTML = "<img src='./assets/volume2.png'/>"
    }else{
        document.getElementById("volume-button").innerHTML = "<img src='./assets/volume1.png'/>"
    }
    if (video.volume == 0.0){
        document.getElementById("volume-button").innerHTML = "<img src='./assets/muted.png'/>"
    } else{
        tempVolume = volumeSlider.value
    }
}

let nextEpisode = document.getElementById("next-episode")
hideEpisode()

function showEpisode(){
    nextEpisode.style.display= "flex"
    disableControlHide = true
    document.getElementById("slider-wrapper").style.display= "hidden"
    nextEpisode.style.height = 80+"px"
    nextEpisode.style.padding = 5+"px"
    if (currentFiles.length > 1){
        document.getElementById("next-title").innerHTML = ""+ currentFiles[currentIndex+1].split(".mp4")[0].split(".mkv")[0]
    }
}

function hideEpisode(){
    nextEpisode.style.height = 0+"px"
    nextEpisode.style.padding = 0+"px"
    document.getElementById("slider-wrapper").style.display= "flex"

}

document.getElementById("overlay").addEventListener("mouseover",function(){
    disableControlHide = false
})

nextButton.addEventListener("mouseover",showEpisode)
nextButton.addEventListener("mouseleave",hideEpisode)

nextEpisode.addEventListener("mouseover",showEpisode)
nextEpisode.addEventListener("mouseleave",hideEpisode)

document.getElementById("volume-popup").addEventListener("mouseover",function(){
    disableControlHide = true
})
document.getElementById("volume-popup").addEventListener("mouseleave",function(){
    disableControlHide = false
})

document.getElementById("volume-button").addEventListener("mouseover",function(){
    disableControlHide = true
})
document.getElementById("volume-button").addEventListener("mouseleave",function(){
    disableControlHide = false
})

document.getElementById("fullscreen-button").addEventListener("mouseover",function(){
    disableControlHide = true
})
document.getElementById("fullscreen-button").addEventListener("mouseleave",function(){
    disableControlHide = false
})

document.getElementById("pause-button").addEventListener("mouseover",function(){
    disableControlHide = true
})
document.getElementById("pause-button").addEventListener("mouseleave",function(){
    disableControlHide = false
})
document.getElementById("back10").addEventListener("mouseover",function(){
    disableControlHide = true
})
document.getElementById("back10").addEventListener("mouseleave",function(){
    disableControlHide = false
})
document.getElementById("next10").addEventListener("mouseover",function(){
    disableControlHide = true
})
document.getElementById("next10").addEventListener("mouseleave",function(){
    disableControlHide = false
})
document.getElementById("close-player").addEventListener("mouseover",function(){
    disableControlHide = true
})
document.getElementById("close-player").addEventListener("mouseleave",function(){
    disableControlHide = false
})

episodesPopup = document.getElementById("episodes-popup")
episodesList = document.getElementById("episodes-list")

let epListShowing = false

function showEpisodesList(){
    episodesPopup.style.display = "flex"
    disableControlHide = true
    document.getElementById("slider-wrapper").style.display= "hidden"
    episodesPopup.style.height = 500+"px"
    episodesPopup.style.padding = 5+"px"
    if (!epListShowing){
        document.getElementById("episodes-wrapper").scrollTop = Math.max((currentIndex * 50 - 150), 0)
        console.log(Math.min((currentIndex * 50 - 150), 0) + "px")
        if (currentFiles.length > 1){
            htmlString = ""
            for(i in currentFiles){
                htmlString += "<div id='episode"+i+"' style ='cursor:"+(i==currentIndex ? "default" : "pointer")+";'class='episode-selector "+(i==currentIndex ? "active" : "")+"' "+(i!=currentIndex ? "onclick = \"selectFile(index="+i+")\"" : "")+">" + currentFiles[i].split(".mp4")[0].split(".mkv")[0] +" </div>"
            }
            episodesList.innerHTML = htmlString
            epListShowing = true
        }
    }
}

function hideEpisodesList(){
    episodesPopup.style.height = 0+"px"
    episodesPopup.style.padding = 0+"px"
    epListShowing = false
    document.getElementById("slider-wrapper").style.display= "hidden"


    // setTimeout(function(){
    //     if (epListShowing){
    //     }
    // }
    // ,300);

}

hideEpisodesList()
episodesList.addEventListener("mouseover",showEpisodesList)
episodesList.addEventListener("mouseleave",hideEpisodesList)
episodesPopup.addEventListener("mouseover",showEpisodesList)
episodesPopup.addEventListener("mouseleave",hideEpisodesList)

document.getElementById("episodes-button").addEventListener("mouseover",showEpisodesList)
document.getElementById("episodes-button").addEventListener("mouseleave",hideEpisodesList)

document.getElementById("slider-wrapper").addEventListener("mousemove", function (e) {
    // var maxduration = video.duration;
    var position = e.pageX - slider.offsetLeft
    var percentage = position / slider.offsetWidth
    if(percentage > 1) {
        percentage = 1
    }
    if(percentage < 0) {
        percentage = 0
    }
    watchtimehover = video.duration * percentage

    document.getElementById("time-hover").innerHTML = convertHMS(watchtimehover)
    document.getElementById("time-hover").style.left = e.pageX + "px"
    document.getElementById("time-hover").style.top = slider.offsetTop - 70 + "px"

    // console.log(convertHMS(watchtimehover))
})


async function minimize(){
    if (playerWatching){
        if (!document.pictureInPictureElement){
            await videoWrapper.requestPictureInPicture();
        }
        else{
            await document.exitPictureInPicture();
        }
    }
}
