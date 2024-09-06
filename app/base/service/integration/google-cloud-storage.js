'use strict';
const GoogleCloudStorage = require('@google-cloud/storage');
const GOOGLE_CLOUD_KEYFILE = __dirname + '/tensile-tenure-319412-98cd05e700c8.json';
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const DEFAULT_BUCKET_NAME = process.env.DEFAULT_BUCKET_NAME;

const storage = new GoogleCloudStorage.Storage({
    projectId: GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: GOOGLE_CLOUD_KEYFILE
});

const getPublicUrl = (bucketName, fileName) => `https://storage.googleapis.com/${bucketName}/${fileName}`;

const imageUploadToGCS = (data) => {
    return new Promise((resolve, reject) => {
        const bucketName = DEFAULT_BUCKET_NAME;
        const bucket = storage.bucket(bucketName);
        const gcsFileName = `${Date.now()}-${data.originalname}`;
        const file = bucket.file(gcsFileName);

        const stream = file.createWriteStream({

            metadata: {
                contentType: 'image/jpg'
            }
        });

        stream.on('error', (err) => {
            data.cloudStorageError = err;
            reject(err);
        });

        stream.on('finish', () => {
            data.cloudStorageObject = gcsFileName;
            return file.makePublic()
                .then(() => {
                    data.gcsUrl = getPublicUrl(bucketName, gcsFileName);
                    return resolve(data.gcsUrl);
                });
        });
        stream.end(data.buffer);
    });
};

module.exports = {
    imageUploadToGCS
};
