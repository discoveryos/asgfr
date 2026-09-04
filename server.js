const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const chapters = {
    '/':        ['intro.txt', 'index.html'],
    '/ch0':     ['ch0_install.txt', 'page-ch0.html'],
    '/ch1':     ['ch1_hello.txt', 'page-ch1.html'],
    '/ch2':     ['ch2_types.txt', 'page-ch2.html'],
    '/ch3':     ['ch3_strings.txt', 'page-ch3.html'],
    '/ch4':     ['ch4_arrays.txt', 'page-ch4.html'],
    '/ch5':     ['ch5_flow.txt', 'page-ch5.html'],
    '/ch6':     ['ch6_loops.txt', 'page-ch6.html'],
    '/ch7':     ['ch7_methods.txt', 'page-ch7.html'],
    '/ch8':     ['ch8_classes.txt', 'page-ch8.html'],
    '/ch9':     ['ch9_blocks.txt', 'page-ch9.html'],
    '/ch10':    ['ch10_files.txt', 'page-ch10.html'],
    '/ch11':    ['ch11_gems.txt', 'page-ch11.html'],
    '/ch12':    ['ch12_examples.txt', 'page-ch12.html'],
    '/ch13':    ['ch13_web.txt', 'page-ch13.html'],
    '/ch14':    ['ch14_games.txt', 'page-ch14.html'],
    '/ch15':    ['ch15_gems_build.txt', 'page-ch15.html'],
    '/ch16':    ['ch16_rails.txt', 'page-ch16.html'],
    '/ch17':    ['ch17_adv_examples.txt', 'page-ch17.html']
};

app.get('*', (req, res) => {
    const ua = req.headers['user-agent'] || '';

    // Browsers get the pretty HTML frontend
    if (!ua.toLowerCase().includes('curl')) {
        const entry = chapters[req.path];
        if (entry && entry[1]) {
            return res.sendFile(path.join(__dirname, 'views', entry[1]));
        }
        return res.status(404).send('Chapter not found.\n');
    }

    // curl gets the plain-text chapter
    const entry = chapters[req.path];
    if (!entry) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(404).send('Chapter not found.\n\nRun: curl localhost:3000 to see the menu.\n');
    }

    fs.readFile(path.join(__dirname, 'guide', entry[0]), 'utf8', (err, data) => {
        if (err) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(500).send('Error reading chapter.\n');
        }
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(data);
    });
});

app.listen(PORT, () => {
    console.log(`ASGFR Ruby guide server running on http://localhost:${PORT}`);
});
