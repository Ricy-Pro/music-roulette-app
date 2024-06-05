const express = require('express');
const { spawn } = require('child_process');

const router = express.Router();

const fs = require('fs');
const path = require('path');

// Fetch URL from url.txt
router.get('/auth/url', (req, res) => {
    const filePath = ('/Users/prodanrobert/Documents/GitHub/music-roulette-app/backend/url.txt')

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading url.txt:', err);
            res.status(500).send('Error reading URL file.');
            return;
        }

        res.send(data.trim());
    });
});
// Setup OAuth
router.get('/auth/setup', (req, res) => {
    const pythonProcess = spawn('python3', ['ytmusic_service.py', 'setup']);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.send('OAuth setup complete.');
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
