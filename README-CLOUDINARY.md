# Cloudinary Setup Guide

This guide explains how to set up and use Cloudinary for uploading images and videos in your TN backend.

## 📋 Prerequisites

1. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
2. **Get Your Credentials**: From your Cloudinary dashboard, get:
   - Cloud Name
   - API Key
   - API Secret

## 🛠️ Setup

### 1. Environment Variables

Create a `.env` file in your backend root directory (or update existing one):

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

⚠️ **Important**: Never commit your `.env` file to version control. Use the provided `.env.example` as a template.

### 2. Test Your Setup

Run the test script to verify your Cloudinary configuration:

```bash
node test-upload.js
```

## 📡 API Endpoints

### Image Upload

#### Single Image
```
POST /api/upload/image/single
Content-Type: multipart/form-data

Body: image (file)
```

#### Multiple Images
```
POST /api/upload/image/multiple
Content-Type: multipart/form-data

Body: images (files, max 10)
```

### Video Upload

#### Single Video
```
POST /api/upload/video/single
Content-Type: multipart/form-data

Body: video (file)
```

#### Multiple Videos
```
POST /api/upload/video/multiple
Content-Type: multipart/form-data

Body: videos (files, max 5)
```

### Mixed Files (Images + Videos)
```
POST /api/upload/mixed
Content-Type: multipart/form-data

Body: files (files, max 15)
```

### Delete File
```
DELETE /api/upload/delete
Content-Type: application/json

Body: 
{
  "public_id": "folder/public-id",
  "resource_type": "image" // or "video"
}
```

## 📁 File Organization

- **Images**: Stored in `tn-images/` folder
- **Videos**: Stored in `tn-videos/` folder
- **Test files**: Stored in `tn-test/` folder (for testing)

## 📏 File Limits

- **Images**: 10MB max per file
- **Videos**: 100MB max per file
- **Mixed uploads**: 100MB max per file
- **Supported image formats**: JPEG, PNG, GIF, WebP
- **Supported video formats**: MP4, MOV, AVI, MKV, WebM

## 🎯 Response Format

### Success Response
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/tn-images/abc123.jpg",
    "public_id": "tn-images/abc123",
    "original_name": "my-image.jpg",
    "size": 1234567,
    "format": "jpg"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error uploading file",
  "error": "Detailed error message"
}
```

## 🧪 Testing with Postman/cURL

### Test Single Image Upload
```bash
curl -X POST \
  http://localhost:5000/api/upload/image/single \
  -H 'Content-Type: multipart/form-data' \
  -F 'image=@/path/to/your/image.jpg'
```

### Test Single Video Upload
```bash
curl -X POST \
  http://localhost:5000/api/upload/video/single \
  -H 'Content-Type: multipart/form-data' \
  -F 'video=@/path/to/your/video.mp4'
```

## 🔧 Frontend Integration

### JavaScript/Fetch Example
```javascript
// Upload single image
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload/image/single', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Upload successful:', result.data.url);
      return result.data;
    } else {
      console.error('Upload failed:', result.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🚀 Advanced Features

### Custom Transformations

You can add custom transformations in the Cloudinary config:

```javascript
// In config/cloudinary.js
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tn-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});
```

### Video Thumbnails

Cloudinary automatically generates thumbnails for uploaded videos. You can access them using:

```
https://res.cloudinary.com/your-cloud/video/upload/w_300,h_200,c_fill/tn-videos/your-video.mp4.jpg
```

## 🛡️ Security Tips

1. **Validate file types**: The middleware already validates file types
2. **Set reasonable limits**: Adjust file size limits based on your needs
3. **Monitor storage**: Regularly check your Cloudinary storage usage
4. **Use signed uploads**: For production, consider using signed uploads for additional security

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid credentials"**: Check your environment variables
2. **"File too large"**: Check file size limits
3. **"Invalid file type"**: Check allowed formats in the middleware
4. **"Upload timeout"**: Check your network connection and file size

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=cloudinary*
```

## 📞 Support

- **Cloudinary Docs**: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Node.js SDK**: [github.com/cloudinary/cloudinary_npm](https://github.com/cloudinary/cloudinary_npm)

---

**Ready to start uploading! 🎉**
