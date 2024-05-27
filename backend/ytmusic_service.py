from ytmusicapi import YTMusic
import sys
import json
import subprocess
import time

def run_oauth():
    process = subprocess.Popen(['ytmusicapi', 'oauth'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Adjust the wait time as needed based on the OAuth authentication process
    time.sleep(20)  
    
    process.stdin.write('\n')
    process.stdin.flush()
    process.communicate()
    process.stdin.close()

def main():
    if len(sys.argv) == 2 and sys.argv[1] == 'setup':
        run_oauth()
        print('OAuth setup complete.')
        return

    try:
        with open('oauth.json') as f:
            pass
    except FileNotFoundError:
        run_oauth()
        print('OAuth setup complete.')

    ytmusic = YTMusic('oauth.json')
    
    library = ytmusic.get_library_songs(limit=10)
    print(json.dumps(library))

if __name__ == '__main__':
    main()
