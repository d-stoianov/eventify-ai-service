import { Request, Response, Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'

import { CONFIG } from '@/config'
import {
    getFaceEmbeddings,
    compareEmbeddingWithMultiple,
    FaceEmbeddings,
} from '@/utils/faceUtils'

interface EventResponse {
    message: 'Success' | 'No matches found'
    photos: string[]
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
            const photosFolder = path.join(eventFolder, 'photos')

            if (!fs.existsSync(eventFolder)) {
                res.status(400).send('No folder by provided id')
                return
            }

            const images = fs.readdirSync(photosFolder)

            const protocol =
                req.get('x-forwarded-proto') || req.protocol || 'http'

            const imageUrls = images.map((file) => {
                return `${protocol}://${req.get(
                    'host'
                )}/uploads/${eventId}/photos/${file}`
            })

            const result: EventResponse = {
                message: 'Success',
                photos: imageUrls,
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
            const photosFolder = path.join(eventFolder, 'photos')
            const embeddingsFolder = path.join(eventFolder, 'embeddings')

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

            const photosFileNames = fs.readdirSync(photosFolder)

            const photosEmbeddings = fs
                .readdirSync(embeddingsFolder)
                .map((file) => {
                    const filePath = path.join(embeddingsFolder, file)
                    // with many faces
                    const embeddingArray = JSON.parse(
                        fs.readFileSync(filePath, 'utf8')
                    ) as FaceEmbeddings

                    return embeddingArray // convert each face embedding to Float32Array
                })

            const selfieEmbeddings = await getFaceEmbeddings(selfiePath)

            // check how many faces
            switch (selfieEmbeddings.length) {
                case 0:
                    res.status(400).send('No faces detected on the selfie')
                    return
                case 1: // 1 face = good, skip
                    break
                default:
                    res.status(400).send('Selfie cant contain more than 1 face')
                    return
            }

            const protocol =
                req.get('x-forwarded-proto') || req.protocol || 'http'

            const convertedImageUrls: string[] = []

            photosEmbeddings.forEach((photoEmbeddings, idx) => {
                const match = compareEmbeddingWithMultiple(
                    selfieEmbeddings[0], // since selfie contains one face, take first one
                    photoEmbeddings
                )

                if (match) {
                    const photoFilePart = photosFileNames[idx]

                    const imgPath = `${protocol}://${req.get(
                        'host'
                    )}/uploads/${eventId}/photos/${photoFilePart}`
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
                photos: convertedImageUrls,
            }

            res.status(200).json(result)
        } catch (error) {
            res.status(400).send((error as Error).message)
        }
    }
)

export default eventRoutes
