import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(
  file: Buffer | string,
  folder: string = 'vladi-burger',
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 800, height: 600, crop: 'fill', quality: 'auto', format: 'webp' },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'))
        resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )

    if (typeof file === 'string') {
      // base64 or URL
      cloudinary.uploader.upload(file, {
        folder,
        transformation: [
          { width: 800, height: 600, crop: 'fill', quality: 'auto', format: 'webp' },
        ],
      }).then(result => {
        resolve({ url: result.secure_url, publicId: result.public_id })
      }).catch(reject)
    } else {
      uploadStream.end(file)
    }
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export { cloudinary }
