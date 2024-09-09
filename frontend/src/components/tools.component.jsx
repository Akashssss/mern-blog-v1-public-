import Embed from '@editorjs/embed';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import { uploadImage, deleteImage } from '../utils/imageUploadUtils';
import ImageTool from '@pawritharya/editorjs-image-tool-delete';

async function uploadImageByUrl(e) {
    let link = new Promise((resolve, reject) => {

        try {
            resolve(e)
        }
        catch (err) {
            reject(err)
        }
    })
    return link.then(url => {
        return {
            success: 1,
            file: { url }
        }
    })
}

async function uploadImageByFile(file) {
    const result = await uploadImage(file);
    if (result.success) {
        return {
            success: 1,
            file: { url: result.file.url }
        };
    } else {
        return {
            success: 0,
            error: result.error
        };
    }
}
const extractPublicId = (url) => {
    // Extract Public ID from the URL
    const regex = /\/v\d+\/(.*?)(?:\.\w+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
};
async function deleteImageByFile(file) {
    console.log("file is ", file);
    const publicId = extractPublicId(file);

    if (!publicId) {
        console.error('Public ID could not be extracted from the URL');
        return;
    }
    console.log("public id is ", publicId);
    await deleteImage(publicId);
}







export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: ImageTool,

        config: {
            uploader: {
                uploadByUrl: uploadImageByUrl,
                uploadByFile: uploadImageByFile
            },
            deleter: {
                deleteFile: deleteImageByFile
            }
        }
    },
    header: {
        class: Header,
        inlineToolbar: true,
        config: {
            placeholder: 'Type heading...',
            levels: [2, 3, 4],
            defaultLevel: 2,
        },
    },
    quote: {
        class: Quote,
        inlineToolbar: true,

    },
    marker: Marker,
    inlineCode: InlineCode,
};
