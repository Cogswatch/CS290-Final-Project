window.onload = function () {
    var modalbd = document.getElementById("modal-backdrop");
    var modal = document.getElementById("score-modal");
    var modal_close_button = document.getElementById("modal-close");
    var modal_accept_button = document.getElementById("modal-accept");
    var name_input = document.getElementById("name-text-input");
    
    let hidden = false;
    
    modal_close_button.addEventListener("click", function(event){
        hidden = !hidden;
        if(hidden)
        {
            modal.classList.add("hidden");
            modalbd.classList.add("hidden");
        }
        else
        {
            modal.classList.remove("hidden");
            modalbd.classList.remove("hidden");
        }
        location.reload();
    });
    
    modal_accept_button.addEventListener("click", function(event){
        modalbd.classList.add("hidden");
        modal.classList.add("hidden");
        console.log(game.score);
        if(name_input.value === '')
        {
            alert("Please enter a name");
        }
        else
        {
            send_score(name_input.value, game.score);
            location.reload();
        }
    });
};

let clientHost = 'localhost'
let clientContext = ':8888/play.html'
var xhr = new XMLHttpRequest();

function send_score(_name, _score) {
    xhr.open("POST", "http://" + clientHost + clientContext, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        name: _name,
        score: _score 
    }));
}
