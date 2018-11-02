var modelData = {
    "spotPosition": {
        "effiel": 2300,
        "peacewall": 4600,
        "chaillot": 5000,
        "birhakeim": 5100,
        "rodinMusuem": 5800,
        "unname_1": 10000,
        "unname_2": 6700,
        "triomphe": 10000
    }
}

function initMapSpot(modelObj){
    var groupSpot = document.getElementById('groupSpot');
    console.log(groupSpot);
    const spotPosition = modelObj.spotPosition;
    
    for(var key in spotPosition){
        var spotElement = document.createElement('i');
        spotElement.setAttribute('id', "spot_"+key);
        spotElement.setAttribute('class', 'icon_map_spot spot_'+key);
        spotElement.dataset.value = spotPosition[key];

        groupSpot.appendChild(spotElement);
    }
}
initMapSpot(modelData);

// function readTextFile(file, callback) {
//     var rawFile = new XMLHttpRequest();
//     rawFile.overrideMimeType("application/json");
//     rawFile.open("GET", file, true);
//     rawFile.onreadystatechange = function() {
//         if (rawFile.readyState === 4 && rawFile.status == "200") {
//             callback(rawFile.responseText);
//         }
//     }
//     rawFile.send(null);
// }



//usage:
// readTextFile("./js/model.json", function(text){
//     modelData = JSON.parse(text);
//     initMapSpot(modelData);
// });