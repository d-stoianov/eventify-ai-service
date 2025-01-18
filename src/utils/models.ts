import path from 'path'
import { Canvas, Image, ImageData } from 'canvas'
import * as faceapi from 'face-api.js'

export const loadModels = async (): Promise<void> => {
    const modelPath = path.join(__dirname, '..', '..', 'models') // models folder is in root
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath)
}

export const patchFaceAPI = (): void => {
    // @ts-ignore
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
}
