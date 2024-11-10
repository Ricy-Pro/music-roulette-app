import sys
import json
from ytmusicapi import YTMusic

def fetch_library(token):
    # Ensure the token is passed correctly
    ytmusic = YTMusic(auth=token)  # This should be a valid dictionary
    library = ytmusic.get_liked_songs(limit=1000)

    # Extract only the relevant fields (title, artist name, thumbnail URL)
    simplified_library = []
    for track in library['tracks']:
        simplified_library.append({
            'title': track['title'],
            'artist': track['artists'][0]['name'] if track['artists'] else "Unknown Artist",
            'thumbnail': track['thumbnails'][0]['url'] if track['thumbnails'] else "No Thumbnail"
        })

    return simplified_library



if __name__ == '__main__':
    # Expect the token as an argument passed from Node.js
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No token provided'}))
        sys.exit(1)

    # Parse the token passed as a string from Node.js
    token = json.loads(sys.argv[1])

    # Fetch the library for the given token
    try:
        library = fetch_library(token)
        
        print(json.dumps(library))  # Output the library data as JSON to stdout
    except Exception as e:
        print(json.dumps({'error': str(e)}))
