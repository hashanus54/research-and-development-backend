const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileCounters = new Map();


const createStorage = (baseUploadDir) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            try {
                if (!req.user || !req.user.id) {
                    return cb(new Error('User not authenticated or user ID missing.'));
                }

                const userSpecificDir = path.join(baseUploadDir, req.user.id.toString(), file.fieldname || 'default');
                const fullPath = path.resolve(`./uploads/${userSpecificDir}`);
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, {recursive: true});
                }
                cb(null, fullPath);
            } catch (error) {
                console.error("Error in storage destination:", error);
                cb(error);
            }
        },
        filename: function (req, file, cb) {
            try {
                if (!file.originalname) {
                    return cb(new Error('File name is missing.'));
                }

                if (!req.user || !req.user.id) {
                    return cb(new Error('User ID is missing.'));
                }

                const counterKey = `${req.user.id}-${file.fieldname}`;

                if (!fileCounters.has(counterKey)) {
                    fileCounters.set(counterKey, 1);
                } else {
                    fileCounters.set(counterKey, fileCounters.get(counterKey) + 1);
                }

                const currentCount = fileCounters.get(counterKey);
                const ext = path.extname(file.originalname).toLowerCase();
                const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "");
                const date = new Date().toISOString();
                const timestamp = Date.now();

                const filename = `${req.user.id}-${file.fieldname}-${currentCount}-${date}-${timestamp}-${baseName}${ext}`;

                cb(null, filename);
            } catch (error) {
                console.error("Error in storage filename:", error);
                cb(error);
            }
        }
    });
};

const resetFileCounters = (userId, fieldname) => {
    const counterKey = `${userId}-${fieldname}`;
    fileCounters.delete(counterKey);
};

const createFileFilter = (allowedTypes) => {
    return (req, file, cb) => {
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error(`Only ${allowedTypes.source} files are allowed!`));
        }
    };
};

const createUpload = ({uploadDir, allowedTypes, maxFileSize = 5 * 1024 * 1024}) => {
    return multer({
        storage: createStorage(uploadDir),
        fileFilter: createFileFilter(allowedTypes),
        limits: {
            fileSize: maxFileSize
        }
    });
};

const createUploadFields = (config) => {
    const upload = createUpload(config);
    return upload.fields(config.fields);
};

const cleanupFiles = (files, uploadDir) => {
    files.forEach(url => {
        const filePath = path.join(__dirname, '..', url);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    });
};

const processUploadedFiles = (files, fieldNames, baseUploadDir, userId) => {
    if (!userId) {
        throw new Error('userId is required for processing uploaded files');
    }

    const processedFiles = {};

    fieldNames.forEach(field => {
        const userSpecificDir = path.join(baseUploadDir, userId.toString(), field);
        processedFiles[field] = files[field] ?
            files[field].map(file => `/uploads/${userSpecificDir}/${file.filename}`) :
            [];
    });

    return processedFiles;
};


const deleteFiles = (fileUrls, baseUploadDir = './uploads') => {
    if (!Array.isArray(fileUrls)) {
        console.error('Invalid input: fileUrls is not an array');
        return;
    }

    if (fileUrls.length === 0) {
        console.warn('No files to delete - empty array provided');
        return;
    }

    fileUrls.forEach((fileUrl, index) => {
        try {
            const cleanedFileUrl = fileUrl.replace(/\/([^/]+)\/\1\//, '/$1/');

            const relativePath = cleanedFileUrl.replace(/^\/uploads\//, '');
            const fullPath = path.join(baseUploadDir, relativePath);

            const fileExists = fs.existsSync(fullPath);
            if (fileExists) {
                fs.unlinkSync(fullPath);
                console.log(`✅ File deleted: ${fullPath}`);
            } else {
                console.log(`❌ File not found: ${fullPath}`);
            }
        } catch (err) {
            console.error(`Error processing file ${fileUrl}:`, err);
        }
    });
};

const uploadConfigs = {
    questionnaire: {
        uploadDir: 'questionnaires',
        allowedTypes: /pdf|doc|docx/,
        maxFileSize: 5 * 1024 * 1024,
        fields: [
            {name: 'applicationUrl', maxCount: 5},
            {name: 'researchPlanUrl', maxCount: 5},
            {name: 'supportingDocumentsUrl', maxCount: 5},
            {name: 'otherDocumentUrl', maxCount: 5}
        ]
    },
    investmentQuestionnaire: {
        uploadDir: 'investmentQuestionnaires',
        allowedTypes: /pdf|doc|docx/,
        maxFileSize: 10 * 1024 * 1024,
        fields: [
            {name: 'projectFile', maxCount: 5},
        ]
    },
    profile: {
        uploadDir: 'users',
        allowedTypes: /jpeg|jpg|png/,
        maxFileSize: 2 * 1024 * 1024,
        fields: [
            {name: 'avatar', maxCount: 1},
        ]
    },
    product: {
        uploadDir: 'news',
        allowedTypes: /jpeg|jpg|png/,
        maxFileSize: 10 * 1024 * 1024,
        fields: [
            {name: 'imageUrl', maxCount: 10},
        ]
    }

};

module.exports = {
    createUploadFields,
    cleanupFiles,
    processUploadedFiles,
    uploadConfigs,
    resetFileCounters,
    deleteFiles
};