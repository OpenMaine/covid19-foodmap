const express = require('express')
const path = require('path')
const app = express()
const port = 3000

app.use("/js", express.static(path.join(__dirname, 'js')))
app.use("/css", express.static(path.join(__dirname, 'css')))
app.use("/map-markers", express.static(path.join(__dirname, 'map-markers')))
app.use("/vendor", express.static(path.join(__dirname, 'vendor')))

app.get('/', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'index.html'))
    } catch(e) {
        console.log(e)
        res.status(500)
    }
})

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))