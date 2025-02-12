import { Request, Response, Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

import { CONFIG } from '@/config'
import { getFaceEmbeddings } from '@/utils/faceUtils'

interface RegisterResult {
    eventId: string
    photos: string[]
    embeddings: string[]
}

const registerRoutes = Router()

const upload = multer({
    dest: path.join(CONFIG.UPLOADS_PATH, 'temp'),
})
const uploadFiles = upload.fields([{ name: 'photos', maxCount: 100 }])

registerRoutes.post(
    '/register',
    uploadFiles,
    async (req: Request, res: Response): Promise<void> => {
        try {
            // generate uuid without dashes
            const eventId = uuidv4().replace(/-/g, '')

            const eventFolder = path.join(CONFIG.UPLOADS_PATH, eventId)
            const photosFolder = path.join(eventFolder, 'photos')
            const embeddingsFolder = path.join(eventFolder, 'embeddings')

            if (!fs.existsSync(eventFolder)) {
                fs.mkdirSync(eventFolder, { recursive: true })
                fs.mkdirSync(photosFolder, { recursive: true })
                fs.mkdirSync(embeddingsFolder, { recursive: true })
            }

            // form data
            const files: any = req.files
            if (files && files['photos']) {
                const photos = files['photos'] as Express.Multer.File[]

                for (const photo of photos) {
                    const tempPath = photo.path

                    const processedPhotoFileName = photo.originalname.replace(
                        / /g,
                        '_' // replace spaces with underscores
                    )

                    // photos
                    const targetPhotoPath = path.join(
                        photosFolder,
                        processedPhotoFileName
                    )

                    // move photo from temp path to /eventid/photos
                    fs.renameSync(tempPath, targetPhotoPath)

                    // write embeddings to json
                    const photoEmbeddings = await getFaceEmbeddings(
                        targetPhotoPath
                    )

                    const photoEmbeddingsArrays = photoEmbeddings.map(
                        (embedding) => Array.from(embedding) // convert each Float32Array to a regular array
                    )

                    const photoEmbeddingsJsonFileName =
                        processedPhotoFileName.replace(
                            path.extname(processedPhotoFileName),
                            '.json'
                        )
                    const photoEmbeddingsJsonPath = path.join(
                        embeddingsFolder,
                        photoEmbeddingsJsonFileName
                    )
                    // write embeddings json to /eventid/embeddings
                    fs.writeFileSync(
                        photoEmbeddingsJsonPath,
                        JSON.stringify(photoEmbeddingsArrays)
                    )
                }
            } else {
                res.status(400).send('No photos received')
                return
            }

            const photos = fs.readdirSync(photosFolder)
            const embeddings = fs.readdirSync(embeddingsFolder)

            const result: RegisterResult = {
                eventId: eventId,
                photos: photos,
                embeddings: embeddings,
            }

            res.status(200).json(result)
        } catch (error) {
            res.status(400).send((error as Error).message)
        }
    }
)

export default registerRoutes
