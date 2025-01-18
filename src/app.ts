import express, { Request, Response } from 'express'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send('testing..')
})

app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`)
})
