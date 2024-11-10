const express = require('express');
const { spawn } = require('child_process');

const router = express.Router();
const User = require('../models/User');
const fs = require('fs');
const path = require('path');


// Get the URL for the OAuth process

router.get('/auth/url', (req, res) => {
    const directory = 'C:/Users/ricir/OneDrive/Documents/GitHub/music-roulette-app/backend';
    
    // Get all files in the directory
    
    const files = fs.readdirSync(directory);
    
    // Filter files that start with 'url' and end with '.txt'
    const urlFiles = files.filter(file => file.startsWith('url') && file.endsWith('.txt'));
    
    if (urlFiles.length === 0) {
        res.status(404).send('No URL file found.');
        return;
    }

    // Sort files by their creation time, latest first
    const latestUrlFile = urlFiles.map(file => ({
        name: file,
        time: fs.statSync(path.join(directory, file)).mtime.getTime() // Get modification time
    })).sort((a, b) => b.time - a.time)[0].name;

    const filePath = path.join(directory, latestUrlFile);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading URL file:', err);
            res.status(500).send('Error reading URL file.');
            return;
        }

        // Send the data back to the client
        console.log('URL sent:', data.trim());
        res.send(data.trim());
        

        // Delete the file after sending the response
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error('Error deleting URL file:', unlinkErr);
            } else {
                console.log(`${latestUrlFile} was deleted.`);
            }
        });
    });
});


// Setup OAuth
router.post('/auth/setup', (req, res) => {
    const { userName } = req.body; // Retrieve userName from the request body

    const pythonProcess = spawn('python3', ['ytmusic_auth.py', 'setup']);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
        if (code === 0) {
            console.log('OAuth setup complete.');

            const directory = 'C:/Users/ricir/OneDrive/Documents/GitHub/music-roulette-app/backend'; // Adjust this path if needed

            try {
                // Get the latest oauth*.json file
                const files = fs.readdirSync(directory);
                const oauthFiles = files.filter(file => file.startsWith('oauth') && file.endsWith('.json'));

                if (oauthFiles.length === 0) {
                    return res.status(404).send('No OAuth token file found.');
                }

                // Sort by modification time and pick the latest file
                const latestOauthFile = oauthFiles
                    .map(file => ({
                        name: file,
                        time: fs.statSync(path.join(directory, file)).mtime.getTime()
                    }))
                    .sort((a, b) => b.time - a.time)[0].name;

                const filePath = path.join(directory, latestOauthFile);

                // Read the latest oauth*.json file
                fs.readFile(filePath, 'utf8', async (err, data) => {
                    if (err) {
                        console.error('Error reading OAuth token file:', err);
                        return res.status(500).send('Failed to read OAuth token.');
                    }

                    const tokenData = JSON.parse(data);

                    try {
                        // Find the user by userName (assuming userName is unique)
                        await User.findOneAndUpdate({ name: userName },{authenticatorToken: {
                            access_token: tokenData.access_token,
                            refresh_token: tokenData.refresh_token,
                            scope: tokenData.scope,
                            token_type: tokenData.token_type,
                            expires_at: tokenData.expires_at,
                            expires_in: tokenData.expires_in
                        }} );


                        // Delete the oauth*.json file after saving the token
                        fs.unlinkSync(filePath);

                        res.send('OAuth setup complete and token saved.');


                    } catch (error) {
                        console.error('Error saving token to database:', error);
                        res.status(500).send('Failed to save OAuth token.');
                    }
                });
            } catch (error) {
                console.error('Error handling OAuth files:', error);
                res.status(500).send('Failed to process OAuth files.');
            }
        } else {
            res.status(500).send(`Python process exited with code ${code}`);
        }
    });
});

// Fetch YouTube Music data
router.get('/music-data/:searchQuery', (req, res) => {
    const searchQuery = req.params.searchQuery;

    fetchMusicData(searchQuery)
        .then((musicData) => {
            res.json(musicData);
        })
        .catch((error) => {
            res.status(500).send(error.message);
        });
});

function fetchMusicData(searchQuery) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['ytmusic_service.py', searchQuery]);

        let responseData = '';

        pythonProcess.stdout.on('data', (data) => {
            responseData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(responseData)); // Parse the JSON response
                } catch (error) {
                    reject(new Error('Failed to parse JSON response'));
                }
            } else {
                reject(new Error(`Python process exited with code ${code}`));
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python process error: ${data.toString()}`);
            reject(new Error(data.toString()));
        });
    });
}

module.exports = router;
