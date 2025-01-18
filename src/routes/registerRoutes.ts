import { Request, Response, Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

interface RegisterResult {
    eventId: string
    photos: string[]
}

const registerRoutes = Router()

const upload = multer({ dest: 'uploads/temp/' })
const uploadFiles = upload.fields([{ name: 'photos', maxCount: 100 }])

registerRoutes.post(
    '/register',
    uploadFiles,
    async (req: Request, res: Response): Promise<void> => {
        try {
            // generate uuid without dashes
            const uniqueId = uuidv4().replace(/-/g, '')

            const eventFolder = path.join('uploads', uniqueId)

            if (!fs.existsSync(eventFolder)) {
                fs.mkdirSync(eventFolder, { recursive: true })
            }

            const files: any = req.files

            if (files && files['photos']) {
                const photos = files['photos'] as Express.Multer.File[]

                for (const photo of photos) {
                    const tempPath = photo.path
                    const targetPath = path.join(
                        eventFolder,
                        photo.originalname
                    )

                    fs.renameSync(tempPath, targetPath)
                }
            } else {
                res.status(400).send('No photos received')
                return
            }

            const result: RegisterResult = {
                eventId: uniqueId,
                photos: files['photos']
                    ? files['photos']?.map((file: any) => file.originalname)
                    : [],
            }

            res.status(200).json(result)
        } catch (error) {
            res.status(400).send((error as Error).message)
        }
    }
)

export default registerRoutes
