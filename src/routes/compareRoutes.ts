import { Request, Response, Router } from 'express'
import { compareSingleWithMultiple } from '../utils/faceUtils'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' })

const uploadFiles = upload.fields([
    { name: 'selfie', maxCount: 1 },
    { name: 'group', maxCount: 100 },
])

const compareRoutes = Router()

compareRoutes.post(
    '/compare',
    uploadFiles,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const files: any = req.files

            const selfiePath = files?.selfie?.[0]?.path
            const groupPaths = (files?.group as any[])?.map((file) => file.path)

            if (!selfiePath) {
                res.status(400).send('Selfie is required')
                return
            }

            if (!groupPaths) {
                res.status(400).send('Group photo is required')
                return
            }

            const result = await compareSingleWithMultiple(
                selfiePath,
                groupPaths
            )

            res.json({ result })
        } catch (error) {
            res.status(400).send((error as Error).message)
        }
    }
)

export default compareRoutes
