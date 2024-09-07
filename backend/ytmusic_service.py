import threading
from ytmusicapi import YTMusic
import sys
import json
import subprocess
import time
import random

def run_oauth():
    process = subprocess.Popen(['ytmusicapi', 'oauth'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Adjust the wait time as needed based on the OAuth authentication process
    time.sleep(30)  
    process.stdin.write('\n')
    process.stdin.flush()
    process.communicate()
    process.stdin.close()

def fetch_library():
    ytmusic = YTMusic('oauth.json')
    library = ytmusic.get_library_songs(limit=1000)
    return library

def select_random_songs(library, num_songs):
    return random.sample(library, num_songs)

def setup_oauth_thread():
    thread = threading.Thread(target=run_oauth)
    thread.start()
    thread.join()  # Wait for the OAuth thread to finish

def main():
    if len(sys.argv) == 2 and sys.argv[1] == 'setup':
        setup_oauth_thread()
        print('OAuth setup complete.')
        return


    ytmusic = YTMusic('oauth.json')
    
    library = select_random_songs(fetch_library(), 5)
    print(json.dumps(library))

if __name__ == '__main__':
    main()
