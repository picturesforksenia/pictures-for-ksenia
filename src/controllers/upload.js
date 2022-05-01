const Aws = require('aws-sdk')
const dbConfig = require('../config/db');
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
})

const showUploadSite = (req, res) => {
    return res.sendFile(path.join(`${__dirname}/../views/index.html`));
};

const uploadFile = database => async (req, res) => {
    const file = req.files[0];

    if (!file) {
        return res.send({
            message: 'u must select a file.',
        });
    }

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uuidv4() + '.JPG',
        Body: file.buffer,
        ACL: 'public-read-write',
        ContentType: 'image/jpeg'
    };

    s3.upload(params, (error, data) => {
        if (error) {
            return res.status(500).send({'err': error})
        }
        console.log('data: ', data)

        const entity = {
            createDate: new Date(),
            name: file.originalname,
            awsUrl: data.Location,
        }

        database.collection(dbConfig.collection).insertOne(entity)
            .then(result => {
                return res.send({
                    message: 'File has been uploaded.',
                })
            })
            .catch(error => {
                console.log(error);
                return res.send({
                    message: 'Error when trying upload image: ${error}',
                });
            })
    })
}

const getRandomFile = database => async (req, res) => {
    try {
        const query = {};
        const dbIds = [];
        const cursor = database.collection(dbConfig.collection).find(query);
        await cursor.forEach(({_id}) => {
            dbIds.push(_id);
        })
        const randomDBId = dbIds[Math.floor(Math.random() * dbIds.length)];
        const randomFile = await database.collection(dbConfig.collection).findOne({_id: randomDBId});
        return res.status(200).send(
            `<img src="${randomFile.awsUrl}" alt="no image found" style="object-fit:cover;height:100%;">`
        );
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
}

const getListFiles = database => async (req, res) => {
    try {
        const query = {};
        const cursor = database.collection(dbConfig.collection).find(query);
        if ((await cursor.count()) === 0) {
            return res.status(500).send({
                message: 'No files found!',
            });
        }
        let fileInfos = [];
        await cursor.forEach(({createDate, name, awsId, awsUrl}) => {
            fileInfos.push({createDate, name, awsId, awsUrl,});
        });

        return res.status(200).send(fileInfos);
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};

module.exports = {
    showUploadSite,
    uploadFile,
    getRandomFile,
    getListFiles
};
