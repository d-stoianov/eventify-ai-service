import { Request, Response, Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'

import { CONFIG } from '@/config'

import { compareSingleWithMultiple } from '@/utils/faceUtils'

interface EventResponse {
    message: 'Success' | 'No matches found'
    images: string[]
}

const upload = multer({
    dest: path.join(CONFIG.UPLOADS_PATH, 'temp'),
})

const uploadFiles = upload.fields([{ name: 'selfie', maxCount: 1 }])

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

            const eventFolder = path.join(CONFIG.UPLOADS_PATH, eventId)

            if (!fs.existsSync(eventFolder)) {
                res.status(400).send('No folder by provided id')
                return
            }

            const images = fs.readdirSync(eventFolder)

            const protocol =
                req.get('x-forwarded-proto') || req.protocol || 'http'

            const imageUrls = images.map((file) => {
                return `${protocol}://${req.get(
                    'host'
                )}/uploads/${eventId}/${file}`
            })

            const result: EventResponse = {
                message: 'Success',
                images: imageUrls,
            }

            res.status(200).json(result)
        } catch (error) {
            res.status(400).send((error as Error).message)
        }
    }
)

// find photos mathed with selfie by event id
eventRoutes.post(
    `/event/:eventId`,
    uploadFiles,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const eventId = req.params.eventId

            if (!eventId) {
                res.status(400).send('No event id')
                return
            }

            const eventFolder = path.join(CONFIG.UPLOADS_PATH, eventId)

            if (!fs.existsSync(eventFolder)) {
                res.status(400).send('No folder by provided id')
                return
            }

            const files: any = req.files
            const selfiePath = files?.selfie?.[0]?.path

            if (!selfiePath) {
                res.status(400).send('Selfie is required')
                return
            }

            const images = fs.readdirSync(eventFolder)
            const imagePaths = images.map((file) => {
                return `${CONFIG.UPLOADS_PATH}/${eventId}/${file}`
            })

            const compareResult = await compareSingleWithMultiple(
                selfiePath,
                imagePaths
            )

            const protocol =
                req.get('x-forwarded-proto') || req.protocol || 'http'

            const convertedImageUrls: string[] = []
            compareResult.forEach((res) => {
                const filePart = res.path.split('/uploads')[1]
                if (!filePart) {
                    return
                }

                const nonAbsolutePath = '/uploads' + filePart

                if (res.match) {
                    const imgPath = `${protocol}://${req.get(
                        'host'
                    )}${nonAbsolutePath}`
                    convertedImageUrls.push(imgPath)
                }
            })

            // delete selfie file when finished
            fs.unlinkSync(selfiePath)

            const result: EventResponse = {
                message:
                    convertedImageUrls.length === 0
                        ? 'No matches found'
                        : 'Success',
                images: convertedImageUrls,
            }

            res.status(200).json(result)
        } catch (error) {
            res.status(400).send((error as Error).message)
        }
    }
)

export default eventRoutes
