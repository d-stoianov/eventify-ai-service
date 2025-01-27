import fs from 'fs'

import { CONFIG } from '@/config'

interface Point {
    x: number
    y: number
}

interface FaceData {
    faceRectangle: {
        x: number
        y: number
        height: number
        width: number
    }
    points: Point[]
    quality: number
}

interface FaceMatch {
    matchResult: number
    image1_face: FaceData
    image2_face: FaceData
}

type FaceAPIResponse =
    | {
          matchedFaces: FaceMatch[]
      }
    | {
          errorCode: 400
          errorMessage: string
          code: 400
          error: string
      }

export interface CompareResult {
    path: string
    match: boolean
}

export const compareSingleWithMultiple = async (
    srcPath: string,
    destPaths: string[]
): Promise<CompareResult[]> => {
    const results: CompareResult[] = []

    const srcBase64 = fs.readFileSync(srcPath, 'base64')

    const promises = destPaths.map(async (destPath) => {
        const destBase64 = fs.readFileSync(destPath, 'base64')

        const response = await fetch(`${CONFIG.API_URL}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Subscriptionkey: CONFIG.API_SUBSCRIPTION_KEY,
            },
            body: JSON.stringify({
                encoded_image1: srcBase64,
                encoded_image2: destBase64,
            }),
        })

        const faceApiResponse: FaceAPIResponse = await response.json()

        const match: boolean =
            'matchedFaces' in faceApiResponse &&
            faceApiResponse.matchedFaces.some(
                (matchedFace) => matchedFace.matchResult !== 0
            )

        return {
            path: destPath,
            match,
        }
    })

    const resolvedResults = await Promise.all(promises)

    results.push(...resolvedResults)

    return results
}
