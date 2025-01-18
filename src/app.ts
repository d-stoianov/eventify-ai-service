import express from 'express'
import * as dotenv from 'dotenv'
import { loadModels, patchFaceAPI } from '@/utils/models'
import compareRoutes from '@/routes/compareRoutes'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/', (_req, res) => {
    res.send('server is running..')
})

app.use('/', compareRoutes)

const startServer = async () => {
    await loadModels()
    patchFaceAPI()

    app.listen(port, () => {
        console.log(`server is running on http://localhost:${port}`)
    })
}

startServer()
