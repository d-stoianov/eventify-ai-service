import * as dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import cors from 'cors'
import { loadModels, patchFaceAPI } from '@/utils/models'
import compareRoutes from '@/routes/compareRoutes'
import registerRoutes from '@/routes/registerRoutes'
import eventRoutes from '@/routes/eventRoutes'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

const uploadsPath =
    process.env.UPLOADS_ABSOLUTE_PATH || path.join(__dirname, '../uploads')

app.get('/', (_req, res) => {
    res.send('server is running..')
})

const corsOptions = {
    origin: process.env.ORIGIN,
}

app.use(cors(corsOptions))
app.use(express.json())

app.set('trust proxy', true)

app.use('/uploads', express.static(uploadsPath))

app.use('/', registerRoutes)
app.use('/', eventRoutes)
app.use('/', compareRoutes)

const startServer = async () => {
    await loadModels()
    patchFaceAPI()

    app.listen(port, () => {
        console.log(`server is running on http://localhost:${port}`)
    })
}

startServer()
