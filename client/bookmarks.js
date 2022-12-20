// Toggle Bookmarks
let bookmarkstoggle = false;
let bookmarks = document.getElementById("bookmarks");
async function toggleBookmarks(){
    if (bookmarkstoggle == true){
        bookmarkstoggle = false;
        bookmarks.classList.add("hidden");    
    }
    else{
        bookmarkstoggle = true;
        bookmarks.classList.remove("hidden");

        let response = await fetch("http://127.0.0.1:8000/bookmarks");
        let bookmarks_content = await response.json();
        bookmarks_content = JSON.parse(JSON.stringify(bookmarks_content));
        let htmlString = "";
        for (i in bookmarks_content){
            htmlString+= "<div id='bookmark' class='bookmark-option' ><img class='bookmark-icon' src='https://s2.googleusercontent.com/s2/favicons?domain_url="+bookmarks_content[i].url+"'/><div id='"+ bookmarks_content[i].name +"' class='bookmark-label' onclick='loadBookmark(this.id)' >"+ bookmarks_content[i].name + "</div><div class='remove-bookmark center'><a class='center' id='"+ bookmarks_content[i].name +"' onclick='removeBookmark(this.id)'><i>X</i></a></div></div>";
        }
        bookmarks.innerHTML = htmlString;
    }
}

// Bookmark Handler
let bookmarkToggle = false;
function bookmarkIconUpdate(){
    if (bookmarkToggle == true){
        document.getElementById("bookmark-icon").classList.remove('fa-regular');
        document.getElementById("bookmark-icon").classList.add('fa-solid');
    } else{
        document.getElementById("bookmark-icon").classList.add('fa-regular');
        document.getElementById("bookmark-icon").classList.remove('fa-solid');
    }
}

async function bookmarkHandler(){
    if (bookmarkToggle == false){
        if (video != null || webpageFrame != null ){
            let new_bname = prompt("Enter Bookmark Name:");
            if (new_bname == null || new_bname == ""){
                let rand_num = Math.floor(Math.random()*90000) + 10000;
                new_bname = "NewBookmark"+ rand_num;
            }
            let parameters = {};
            if (video != null){
                parameters = {
                    "name":new_bname,
                    "type": "local",
                    "url": currentpath+"/"+videoTitle.innerHTML+".mp4", // EDIT
                    "watchtime": video.currentTime
                };
                
            } else if (webpageFrame != null){
                parameters = {
                    "name":new_bname,
                    "type": "webpage",
                    "url": webpageFrame.src,
                    "watchtime": null
                };
            }
            bookmarkToggle = true;
            bookmarkIconUpdate();
            let response = await fetch('http://127.0.0.1:8000/bookmark/new', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(parameters)
            });
            
        } else{
            videoPlayer.innerHTML = "<p>No Video Or Webpage to Bookmark</p>";
        }
    }   
}

// Remove Bookmarks
async function removeBookmark(id){
    toggleBookmarks()
    let parameters = {bookmarkName:id};
    let response = await fetch('http://127.0.0.1:8000/bookmark/remove', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameters)
    });
}

// Load Bookmark
async function loadBookmark(id){
    toggleBookmarks()
    let parameters = {bookmarkName:id};
    let response = await fetch('http://127.0.0.1:8000/bookmark/load', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameters)
    });
    let bookmark_obj = await response.json();
    bookmark_obj = JSON.parse(JSON.stringify(bookmark_obj));
    if (bookmark_obj.type == "local"){
        let split_path = bookmark_obj.url.split("/")
        currentpath = split_path[0]+"/"+split_path[1]
        
        let videoName = decodeURIComponent(split_path[2]);            
        htmlString = getVideo(videoName,null);
        videoPlayer.innerHTML = htmlString;
        video = document.getElementById("video");
        webpageFrame = null;

        video.currentTime = bookmark_obj.watchtime;
        videoTitle.innerHTML = videoName.split(".mp4")[0].split(".mkv")[0];

        bookmarkToggle = false;
        bookmarkIconUpdate();
        videoWrapper.classList.remove("hidden");
        fileExplorer.classList.add("hidden");
        
        navBar.classList.add("hidden");   
        mainBody.style.height = "100vh"
        
    } else{
        onlineSearchBar.value = bookmark_obj.url;
        loadURL();
    }
}