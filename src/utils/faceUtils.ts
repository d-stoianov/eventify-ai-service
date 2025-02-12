import { loadImage } from 'canvas'
import * as faceapi from 'face-api.js'

export type FaceEmbedding = Float32Array<ArrayBufferLike>
export type FaceEmbeddings = FaceEmbedding[]

export const getFaceEmbeddings = async (
    imagePath: string
): Promise<FaceEmbeddings> => {
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
    destEmbeddings: FaceEmbeddings
): boolean => {
    const threshold = 0.55 // distance threshold for matching

    return destEmbeddings.some((destEmbedding: FaceEmbedding, idx) => {
        const distance = faceapi.euclideanDistance(srcEmbedding, destEmbedding)
        return distance < threshold
    })
}
