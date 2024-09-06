const {
    imageUploadToGCS
} = require('../base/service/integration/google-cloud-storage');

const uploadImage = async (param, files, user) => {
    const images = [];
    if (files.length > 0) {
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            const imageUrl = await imageUploadToGCS(element);
            images.push(imageUrl);
        }
        return Promise.resolve(images);
    } else {
        return Promise.reject('Admin payan picture bhi add kro');
    }
};

module.exports = {
    uploadImage
};
