const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Check if Cloudinary is properly configured
const cloudinaryConfig = require('./config/cloudinary');
const cloudinary = cloudinaryConfig.cloudinary;
const isCloudinaryConfigured = cloudinaryConfig.isConfigured;

// Function to upload video to Cloudinary
async function uploadVideoToCloudinary(videoPath, folder = 'home-content/videos') {
  if (!isCloudinaryConfigured) {
    console.log('⚠️  Cloudinary not configured, using local path:', videoPath);
    return videoPath;
  }

  try {
    // Check if file exists locally
    const fullPath = path.join(__dirname, '..', 'public', videoPath);
    if (!fs.existsSync(fullPath)) {
      console.log('⚠️  Local video file not found:', fullPath);
      return videoPath;
    }

    console.log(`📤 Uploading video to Cloudinary: ${videoPath}`);
    
    const result = await cloudinary.uploader.upload(fullPath, {
      resource_type: 'video',
      folder: folder,
      public_id: path.basename(videoPath, path.extname(videoPath)),
      format: 'mp4'
    });

    console.log(`✅ Video uploaded successfully: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading video ${videoPath}:`, error.message);
    return videoPath; // Fallback to local path
  }
}

// Function to upload multiple videos
async function uploadVideos(videos, folder = 'home-content/videos') {
  console.log(`📤 Starting upload of ${videos.length} videos to Cloudinary...`);
  
  const uploadedVideos = await Promise.all(
    videos.map(async (video, index) => {
      console.log(`📤 Processing video ${index + 1}/${videos.length}: ${video.src}`);
      
      const uploadedVideo = { ...video };
      
      if (video.src && !video.src.includes('cloudinary')) {
        uploadedVideo.src = await uploadVideoToCloudinary(video.src, folder);
      }
      
      // Handle reels with thumbnails
      if (video.thumbnail && video.thumbnail !== video.src) {
        if (video.thumbnail.includes('cloudinary')) {
          uploadedVideo.thumbnail = video.thumbnail;
        } else {
          uploadedVideo.thumbnail = await uploadVideoToCloudinary(video.thumbnail, folder);
        }
      } else if (video.src) {
        uploadedVideo.thumbnail = uploadedVideo.src;
      }
      
      return uploadedVideo;
    })
  );
  
  console.log(`✅ All videos uploaded successfully!`);
  return uploadedVideos;
}

// Video data from migrate-home-content.js
const videos = [
  {
    src: '/media/Green Black and Brown Simple Ayurveda Hair Oil Mobile Video.mp4',
    title: 'Ayurvedic Hair Oil Treatment',
    description: 'Natural ingredients for healthy, beautiful hair'
  },
  {
    src: '/media/PC.mp4',
    title: 'Professional Hair Care',
    description: 'Salon-quality treatments at home'
  }
];

const reels = [
  {
    src: '/assets/video/aaaaa.mp4',
    thumbnail: '/assets/video/aaaaa.mp4',
    title: 'Hair Transformation',
    customer: 'Sarah M.',
    enabled: true
  },
  {
    src: '/assets/video/VID-20250109-WA0000.mp4',
    thumbnail: '/assets/video/VID-20250109-WA0000.mp4',
    title: 'Golden Shine Treatment',
    customer: 'Maria L.',
    enabled: true
  },
  {
    src: '/assets/video/VID_20250308_164213_003.mp4',
    thumbnail: '/assets/video/VID_20250308_164213_003.mp4',
    title: 'Silky Smooth Results',
    customer: 'Emma K.',
    enabled: true
  },
  {
    src: '/assets/video/VID_20250920_142015_803.mp4',
    thumbnail: '/assets/video/VID_20250920_142015_803.mp4',
    title: 'Volume Boost',
    customer: 'Lisa R.',
    enabled: true
  },
  {
    src: '/assets/video/VID-20250721-WA0065.mp4',
    thumbnail: '/assets/video/VID-20250721-WA0065.mp4',
    title: 'Color Protection',
    customer: 'Ana P.',
    enabled: true
  },
  {
    src: '/assets/video/VID_20251128_021236_574.mp4',
    thumbnail: '/assets/video/VID_20251128_021236_574.mp4',
    title: 'Repair Therapy',
    customer: 'Nina S.',
    enabled: true
  },
  {
    src: '/assets/video/VID_20251112_140113_571.mp4',
    thumbnail: '/assets/video/VID_20251112_140113_571.mp4',
    title: 'Deep Conditioning',
    customer: 'Julia T.',
    enabled: true
  },
  {
    src: '/assets/video/VID_20250308_164210_406.mp4',
    thumbnail: '/assets/video/VID_20250308_164210_406.mp4',
    title: 'Blonde Perfection',
    customer: 'Camille D.',
    enabled: true
  },
  {
    src: '/assets/video/WhatsApp Video 2026-01-04 at 11.03.55 AM.mp4',
    thumbnail: '/assets/video/WhatsApp Video 2026-01-04 at 11.03.55 AM.mp4',
    title: 'Quick Transform',
    customer: 'Nadia H.',
    enabled: true
  },
  {
    src: '/assets/video/VID-20250109-WA0000.mp4',
    thumbnail: '/assets/video/VID-20250109-WA0000.mp4',
    title: 'Straightening Magic',
    customer: 'Yasmine R.',
    enabled: true
  },
  {
    src: '/assets/video/VID_20250308_164213_003.mp4',
    thumbnail: '/assets/video/VID_20250308_164213_003.mp4',
    title: 'Color Protection',
    customer: 'Ana P.',
    enabled: true
  },
  {
    src: '/assets/video/VID_20250920_142015_803.mp4',
    thumbnail: '/assets/video/VID_20250920_142015_803.mp4',
    title: 'Gloss Finish',
    customer: 'Fatima Z.',
    enabled: true
  }
];

async function uploadAllVideos() {
  try {
    console.log('🚀 Starting video upload process...');
    
    // Check Cloudinary configuration
    if (!isCloudinaryConfigured) {
      console.log('❌ Cloudinary not configured. Please check your .env file.');
      console.log('Required variables:');
      console.log('- CLOUDINARY_CLOUD_NAME');
      console.log('- CLOUDINARY_API_KEY');
      console.log('- CLOUDINARY_API_SECRET');
      return;
    }

    console.log('✅ Cloudinary configured successfully');
    
    // Upload videos
    console.log('\n📤 Uploading videos...');
    const uploadedVideos = await uploadVideos(videos, 'home-content/videos');
    
    // Upload reels
    console.log('\n📤 Uploading reels...');
    const uploadedReels = await uploadVideos(reels, 'home-content/reels');
    
    // Display results
    console.log('\n🎉 Upload Complete!');
    console.log('\n📋 Cloudinary URLs:');
    
    console.log('\n🎬 Videos:');
    uploadedVideos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}: ${video.src}`);
    });
    
    console.log('\n🎥 Reels:');
    uploadedReels.forEach((reel, index) => {
      console.log(`${index + 1}. ${reel.title}: ${reel.src}`);
    });
    
    // Save results to file
    const results = {
      videos: uploadedVideos,
      reels: uploadedReels
    };
    
    fs.writeFileSync('cloudinary-urls.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results saved to: cloudinary-urls.json');
    
  } catch (error) {
    console.error('❌ Error during upload:', error);
  }
}

// Run the upload
uploadAllVideos();
