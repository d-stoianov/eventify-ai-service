import { Request, Response, Router } from 'express'
import fs from 'fs'
import path from 'path'

interface EventGetResult {
    message: string
    images: string[]
}

const eventRoutes = Router()

eventRoutes.get(
    `/event`,
    async (req: Request, res: Response): Promise<void> => {
        try {
            res.status(400).send('No event id')
        } catch (error) {
            res.status(400).send((error as Error).message)
        }
    }
)

// find all photos by event id
eventRoutes.get(
    `/event/:eventId`,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const eventId = req.params.eventId

            if (!eventId) {
                res.status(400).send('No event id')
                return
            }

            const eventFolder = path.join('uploads', eventId)

            if (!fs.existsSync(eventFolder)) {
                res.status(400).send('No folder by provided id')
                return
            }

            const images = fs.readdirSync(eventFolder)

            const imageUrls = images.map((file) => {
                return `${req.protocol}://${req.get(
                    'host'
                )}/uploads/${eventId}/${file}`
            })

            const result: EventGetResult = {
                message: 'Success',
                images: imageUrls,
            }

            res.status(200).json(result)
        } catch (error) {
            res.status(400).send((error as Error).message)
        }
    }
)

export default eventRoutes
