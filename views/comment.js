function addComment() {  
    var sec = document.getElementById("commentSection");
    const newDiv = document.createElement("div");
    newDiv.innerHTML += '<div class="Comment" name="newComment"></div><label for="CommentDisplay"> Name: </label><div class="CommentDisplay" name="CommentDisplay"></div><br><label for="CommentDisplay"> Email: </label><div class="CommentDisplay" name="CommentDisplay"></div><br><label for="CommentDisplay"> Response: <div class="CommentDisplay" name="CommentDisplay"></div></label>';
    sec.appendChild(newDiv);
    console.log("Create comment script run successfully!");
}  