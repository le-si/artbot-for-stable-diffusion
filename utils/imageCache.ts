import { CreateImageJob } from '../types'
import {
  allPendingJobs,
  db,
  deletePendingJob,
  getPendingJobDetails
} from './db'

export const initIndexedDb = () => {}

export const checkImageJob = async (jobId: string) => {
  if (!jobId || !jobId?.trim()) {
    return {
      success: false,
      status: 'Invalid jobId'
    }
  }

  const res = await fetch(`/artbot/api/check`, {
    method: 'POST',
    body: JSON.stringify({
      id: jobId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()

  return {
    success: true,
    jobId,
    ...data
  }
}

export const createImageJob = async (imageParams: CreateImageJob) => {
  const apikey = localStorage.getItem('apikey') || '0000000000'
  const { prompt } = imageParams

  if (!prompt || !prompt?.trim()) {
    return {
      success: false,
      status: 'Invalid prompt'
    }
  }

  const params: CreateImageJob = {
    prompt: imageParams.prompt,
    height: imageParams.height || 512,
    width: imageParams.width || 512,
    cfg_scale: imageParams.cfg_scale || '12.0',
    steps: imageParams.steps || 50,
    sampler: imageParams.sampler || 'k_euler_a'
  }

  if (imageParams.seed) {
    params.seed = imageParams.seed
  }

  const res = await fetch(`/artbot/api/create`, {
    method: 'POST',
    body: JSON.stringify(Object.assign({}, params, { apikey })),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()
  const { id: jobId } = data

  if (jobId) {
    const jobDetails = await checkImageJob(jobId)
    const { queue_position, wait_time } = jobDetails

    await db.pending.add({
      jobId,
      timestamp: Date.now(),
      queue_position,
      wait_time,
      ...params
    })

    return {
      success: true,
      ...params,
      jobDetails
    }
  }

  return {
    success: false,
    message: 'Something unfortunate happened...'
  }
}

export const getImage = async (jobId: string) => {
  if (!jobId || !jobId?.trim()) {
    return {
      success: false,
      status: 'Invalid id'
    }
  }

  const res = await fetch(`/artbot/api/get-image`, {
    method: 'POST',
    body: JSON.stringify({
      id: jobId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()

  return {
    success: true,
    jobId,
    ...data
  }
}

export const getCurrentJob = async () => {
  let jobDetails
  const allKeys = await allPendingJobs()
  const [firstJob] = allKeys

  if (!firstJob) {
    return
  }

  const { jobId } = firstJob

  if (jobId) {
    // @ts-ignore
    jobDetails = await checkImageJob(jobId)
  }

  // TODO: check verification message for missing images / jobs
  if (jobDetails?.message) {
    if (jobDetails.message.indexOf('not found') >= 0) {
      deletePendingJob(jobId)
      return
    }
  }

  if (jobDetails?.done) {
    // @ts-ignore
    const imageDetails = await getPendingJobDetails(jobId)
    deletePendingJob(jobId)

    // @ts-ignore
    const imgDetails = await getImage(jobId)

    await db.completed.add({
      jobId,
      ...imageDetails,
      ...imgDetails,
      timestamp: Date.now()
    })

    return {
      success: true,
      newImage: true
    }
  }

  return {
    newImage: false
  }
}

let hasNewImage = false

export const getHasNewImage = () => {
  return hasNewImage
}

export const setHasNewImage = (bool: boolean) => {
  hasNewImage = bool
}
