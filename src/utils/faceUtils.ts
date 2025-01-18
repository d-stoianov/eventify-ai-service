import { loadImage } from 'canvas'
import * as faceapi from 'face-api.js'

export const getFaceDescriptors = async (imagePath: string): Promise<any> => {
    const img: any = await loadImage(imagePath)
    const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors()
    return detections.map((det) => det.descriptor)
}

interface CompareResult {
    path: string
    match: boolean
}

export const compareSingleWithMultiple = async (
    srcPath: string,
    destPaths: string[]
): Promise<CompareResult[]> => {
    const srcDescriptors = await getFaceDescriptors(srcPath)

    if (srcDescriptors.length === 0) {
        throw new Error('No face detected in source')
    }

    const srcDescriptor = srcDescriptors[0] // assume the src contains only one face

    const threshold = 0.6 // distance threshold for matching
    const result: CompareResult[] = []

    // compare the src with dest photo
    for (const destPath of destPaths) {
        const destDescriptors = await getFaceDescriptors(destPath)

        const match = destDescriptors.some((destDescriptor: any) => {
            const distance = faceapi.euclideanDistance(
                srcDescriptor,
                destDescriptor
            )
            return distance < threshold
        })

        result.push({
            path: destPath,
            match,
        })
    }

    return result
}
