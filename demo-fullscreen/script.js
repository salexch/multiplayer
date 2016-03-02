/**
 * Created by Alex on 2/28/2016.
 */
// Define some variables used to remember state.

var playlist = [];
var player,
    player_container = document.getElementById('player');


// After the API loads, call a function to get the uploads playlist ID.
function handleAPILoaded() {
    //requestUserUploadsPlaylistId();
    var request = gapi.client.youtube.playlists.list({
        mine: true,
        part: 'snippet,contentDetails'
    });
    request.execute(function(response) {
        var select;
        console.log(response);

        var options_html = ['<option value="">Choose Playlist</option>'];
        (response.result.items || []).forEach(function(playlist) {
            options_html.push('<option value="' + playlist.id + '">' + playlist.snippet.title + ' (' + playlist.id + ')</option>');
        });

        document.getElementById('playlists').querySelector('span').innerHTML = '<select>' + options_html.join() + '</select>';

        select = document.getElementById('playlists').querySelector('select');
        select.onchange = function() {
            console.log(this.selectedIndex, this.options[this.selectedIndex].value);
            var playlistId = this.options[this.selectedIndex].value;

            if (playlistId)
                requestVideoPlaylist(playlistId);
            else
                try {
                    player.destroy();
                    document.getElementById('player').innerHTML = '';
                } catch (e) {}
        };

    });
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
    return null;
}

(function() {
    var playlistId = getQueryVariable('playlistid');
    player_container.innerHTML = 'Loading..';

    if (location.protocol == 'file:')
        playlistId = 'PLkk05-S5KMvy6pLPittY5TTbAbzAO2n33';

    $.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        part:'snippet',
        playlistId: playlistId,
        key: 'AIzaSyBtHXgAjEz4QU2XlzflJAmn7RHrkB_fo-U'
    }).then(function(res) {
        console.log(res.items);
        playVideos(res.items)
    });
})();

/*
document.getElementById('load_custom_playlist').onclick = function() {
    var playlistId = document.getElementById('custom_playlist').value;
    if (!playlistId)
        return;

    player_container.innerHTML = 'Loading..';

    $.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        part:'snippet',
        playlistId: playlistId,
        key: 'AIzaSyBtHXgAjEz4QU2XlzflJAmn7RHrkB_fo-U'
    }).then(function(res) {
        console.log(res.items);
        playVideos(res.items)
    });
};
*/


// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(playlistId, pageToken) {
    $('#video-container').html('');
    var requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 10
    };
    if (pageToken) {
        requestOptions.pageToken = pageToken;
    }

    player_container.innerHTML = 'Loading..';

    var request = gapi.client.youtube.playlistItems.list(requestOptions);
    request.execute(function(response) {
        playVideos(response.result.items);
    });
}

function playVideos(items) {
    console.log(items);

    playlist = items.map(function(item) {
        return {
            id: item.snippet.resourceId.videoId,
            api: 'youtube'
        }
    });

    try {
        player.destroy();
    } catch (e) {}

    player_container.innerHTML = '';

    player = new MultiPlayer.Player('player', {
        playerVars: {
            autohide: 2,
            autoplay: 1,
            controls: 0,
            fs: 1,
            loop: 1,
            modestbranding: 0,
            rel: 0,
            showinfo: 0
        }
    }, {
        useTransition: [
            'circle',
            'curtain',
            'frame-it',
            'jammed-blind',
            'lateral-swipe',
            'lazy-stretch',
            'origami',
            'parallelogram',
            'spill',
            'tilted',
            'tunnel-vision',
            'wave',
            'widescreen-wiper'
        ]
    });

    player.setLoop(true);

    function playerEvents(e) {
        if (e.data == 1) {
            document.querySelector('#logo').classList.add('small');
            player.removeEventListener('onStateChange', playerEvents);
        }
    }

    player.addEventListener('onStateChange', playerEvents);

    player.loadPlaylist({
        list: playlist
    });
}
