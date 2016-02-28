/**
 * Created by Alex on 2/28/2016.
 */
// Define some variables used to remember state.
var playlistId, nextPageToken, prevPageToken;

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

        var options_html = ['<option>Choose Playlist</option>'];
        (response.result.items || []).forEach(function(playlist) {
            options_html.push('<option value="' + playlist.snippet.channelId + '">' + playlist.snippet.title + ' (' + playlist.snippet.channelId + ')</option>');
        });

        document.getElementById('playlists').querySelector('span').innerHTML = '<select>' + options_html.join() + '</select>';

        select = document.getElementById('playlists').querySelector('select');
        select.onchange = function() {
            console.log(this.selectedIndex, this.options[this.selectedIndex].value);
            var playlistId = this.options[this.selectedIndex].value;

            requestVideoPlaylist(playlistId);
        };

        //playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
        //requestVideoPlaylist(playlistId);
    });
}

// Call the Data API to retrieve the playlist ID that uniquely identifies the
// list of videos uploaded to the currently authenticated user's channel.
function requestUserUploadsPlaylistId() {
    // See https://developers.google.com/youtube/v3/docs/channels/list
    var request = gapi.client.youtube.channels.list({
        mine: true,
        part: 'snippet,contentDetails'
    });
    request.execute(function(response) {
        console.log(response);
        playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
        //requestVideoPlaylist(playlistId);
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
        return false;


        // Only show pagination buttons if there is a pagination token for the
        // next or previous page of results.
        nextPageToken = response.result.nextPageToken;
        var nextVis = nextPageToken ? 'visible' : 'hidden';
        $('#next-button').css('visibility', nextVis);
        prevPageToken = response.result.prevPageToken
        var prevVis = prevPageToken ? 'visible' : 'hidden';
        $('#prev-button').css('visibility', prevVis);

        var playlistItems = response.result.items;
        if (playlistItems) {
            $.each(playlistItems, function(index, item) {
                displayResult(item.snippet);
            });
        } else {
            $('#video-container').html('Sorry you have no uploaded videos');
        }
    });
}

// Create a listing for a video.
function displayResult(videoSnippet) {
    var title = videoSnippet.title;
    var videoId = videoSnippet.resourceId.videoId;
    $('#video-container').append('<p>' + title + ' - ' + videoId + '</p>');
}

// Retrieve the next page of videos in the playlist.
function nextPage() {
    requestVideoPlaylist(playlistId, nextPageToken);
}

// Retrieve the previous page of videos in the playlist.
function previousPage() {
    requestVideoPlaylist(playlistId, prevPageToken);
}