// src/utils/azureStorageUtils.js

export const uploadPhotoMetadataToAzure = async ({ userId, photoData, petName, emotion, filename }) => {
    const backendResponse = await fetch('http://localhost:3001/api/gallery/save-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            photo_data: photoData,
            pet_name: petName,
            emotion,
            filename
        })
    });

    if (!backendResponse.ok) {
        throw new Error(`Failed to upload photo metadata to backend: ${backendResponse.status}`);
    }

    return await backendResponse.json(); // { photo_url: string }
};

export const uploadVideoMetadataToAzure = async ({ videoPath, userId, petName }) => {
    const backendResponse = await fetch('http://localhost:3001/api/gallery/save-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_path: videoPath, user_id: userId, pet_name: petName })
    });

    if (!backendResponse.ok) {
        throw new Error(`Failed to upload video metadata to backend: ${backendResponse.status}`);
    }

    return await backendResponse.json(); // { video_url: string }
};
