import express from 'express'
import * as dotenv from 'dotenv'
import { loadModels, patchFaceAPI } from './utils/models'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

const startServer = async () => {
    await loadModels()
    patchFaceAPI()

    app.listen(port, () => {
        console.log(`server is running on http://localhost:${port}`)
    })
}

startServer()
