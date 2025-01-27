import express from 'express'
import cors from 'cors'

import { CONFIG } from '@/config'

import compareRoutes from '@/routes/compareRoutes'
import registerRoutes from '@/routes/registerRoutes'
import eventRoutes from '@/routes/eventRoutes'

const app = express()
const port = CONFIG.PORT

const uploadsPath = CONFIG.UPLOADS_PATH

app.get('/', (_req, res) => {
    res.send('server is running..')
})

const corsOptions = {
    origin: CONFIG.ORIGIN,
}

app.use(cors(corsOptions))
app.use(express.json())

app.set('trust proxy', true)

app.use('/uploads', express.static(uploadsPath))

app.use('/', registerRoutes)
app.use('/', eventRoutes)
app.use('/', compareRoutes)

const startServer = async () => {
    app.listen(port, () => {
        console.log(`server is running on http://localhost:${port}`)
    })
}

startServer()
