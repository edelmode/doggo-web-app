// src/utils/piControlUtils.js

export const capturePhotoFromPi = async (piControlUrl) => {
    const response = await fetch(`${piControlUrl}/camera/capture_photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });

    if (!response.ok) {
        throw new Error(`Failed to capture photo: ${response.status}`);
    }

    return await response.json(); // { photo: base64, emotion: string }
};

export const savePhotoToPi = async ({ piControlUrl, userId, petName, emotion }) => {
    const response = await fetch(`${piControlUrl}/take_and_save_photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, pet_name: petName, emotion })
    });

    if (!response.ok) {
        throw new Error(`Failed to save photo to Pi: ${response.status}`);
    }

    return await response.json(); // { photo: base64, filename: string }
};

export const startPiRecording = async (piControlUrl) => {
    const response = await fetch(`${piControlUrl}/start_recording`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`Failed to start recording: ${response.status}`);
    }

    return true;
};

export const stopPiRecording = async (piControlUrl) => {
    const response = await fetch(`${piControlUrl}/stop_recording`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`Failed to stop recording: ${response.status}`);
    }

    return await response.json(); // { video_path: string }
};
