import { loadImage } from 'canvas'
import * as faceapi from 'face-api.js'

type FaceEmbedding = Float32Array<ArrayBufferLike>

export const getFaceEmbeddings = async (
    imagePath: string
): Promise<FaceEmbedding[]> => {
    console.log('imagePath', imagePath)

    const img: any = await loadImage(imagePath)
    const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors()
    return detections.map((det) => det.descriptor)
}

export const compareEmbeddingWithMultiple = (
    srcEmbedding: FaceEmbedding,
    destEmbeddings: FaceEmbedding[]
): boolean => {
    const threshold = 0.55 // distance threshold for matching

    const match = destEmbeddings.some((destEmbedding: FaceEmbedding) => {
        const distance = faceapi.euclideanDistance(srcEmbedding, destEmbedding)
        return distance < threshold
    })

    return match
}
