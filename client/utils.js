// FIND OUT WHAT THIS DOES!
Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function(){
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
})

// Select Folder 
function selectFolder(folder){
    selectedFolder.value = folder;
    
    document.getElementById('home-lbl').classList.remove("active");
    document.getElementById('series-lbl').classList.remove("active");
    document.getElementById('movies-lbl').classList.remove("active");
    document.getElementById('clips-lbl').classList.remove("active");

    document.getElementById(folder+'-lbl').classList.add("active");
    fileList.classList.remove("hidden");
    videoInfo.classList.add("hidden");
    renderFolder(folder);
    path = folder;


}