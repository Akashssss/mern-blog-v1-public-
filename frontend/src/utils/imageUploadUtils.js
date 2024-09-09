import axios from 'axios';

// Function to upload an image to your backend
export async function uploadImage(file, oldPublicId = null) {
    const formData = new FormData();
    formData.append('banner', file);
    if (oldPublicId) {
        formData.append('oldPublicId', oldPublicId);
    }

    try {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
           console.log(response.data.file)
        return {
            success: 1,
            file: { url: response.data.imageUrl, publicId: response.data.publicId }
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        return {
            success: 0,
            error: 'Error uploading image'
        }; 
    }
}

// Function to delete an image from Cloudinary
export async function deleteImage(publicId) {
    try {console.log('Deleting image' , publicId); ; 
        await axios.delete(`${import.meta.env.VITE_SERVER_DOMAIN}/delete`, {data:{ publicId }});
    } catch (error) {
        console.error('Error deleting image:', error);
    }
}
