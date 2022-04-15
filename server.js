const express = require('express');
const res = require('express/lib/response');
const multer = require('multer');
const uuid = require('uuid').v4;
const app = express();
const fs = require('fs');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload')
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, `${uuid()}-${originalname}`)
    }
})
const upload = multer({ storage })
app.use(express.static('upload'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'public');
})

app.post('/upload', upload.array('file'), (req, res) => {
    try {
        const data = []
        console.log(req.files, "files")
        req.files.forEach((item) => {
            data.push({
                filename: item.filename,
                size: item.size
            })
        })
        res.send({ data })
    } catch (err) {
        res.send('Something went wrong')
    }
})
app.get("/download/:name", function (req, res) {
    // The res.download() talking file path to be downloaded
    res.download(__dirname + "/upload/" + req.params.name, function (err) {
        if (err) {
            res.send("SOme ting k")
            console.log(err);
        }
    });
});

app.get('/video', (req, res) => {
    try {
        const range = req.headers.range;
        if (!range) {
            res.status(400).send("Requires range Header")
        }
        const videopath = "HowTo.mp4";
        const videoSize = fs.statSync("HowTo.mp4").size;

        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        }
        res.writeHead(206, headers);

        const videoStream = fs.createReadStream(videopath, { start, end });

        videoStream.pipe(res);
    } catch (err) {
        console.log(err, "error")
    }
})
app.listen(3002, () => {
    console.log('server isstarted on 3002')
})