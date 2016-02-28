/**
 * Created by Alex on 2/28/2016.
 */
// Define some variables used to remember state.

var playlist = [];
var player;


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
    var request = gapi.client.youtube.playlistItems.list(requestOptions);
    request.execute(function(response) {
        console.log(response.result.items);

        playlist = response.result.items.map(function(item) {
            return {
                id: item.snippet.resourceId.videoId,
                api: 'youtube'
            }
        });

        try {
            player.destroy();
            document.getElementById('player').innerHTML = '';
        } catch (e) {}

        player = new MultiPlayer.Player('player', {
            playerVars: {
                autohide: 2,
                autoplay: 1,
                //controls: 0,
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

        player.loadPlaylist({
            list: playlist
        });
    });


}

