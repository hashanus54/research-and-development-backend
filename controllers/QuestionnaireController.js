const Questionnaire = require('../schemas/QuestionnaireSchema');
const User = require('../schemas/UserSchema');
const ENUMS = require('../schemas/enums/QuestionnaireEnums');
const {
    createUploadFields,
    cleanupFiles,
    processUploadedFiles,
    uploadConfigs,
    resetFileCounters,
    deleteFiles
} = require('../utils/FileUploadUtil');
const multer = require('multer');
const {sendCustomConfirmationEmail} = require('../utils/EmailUtil');
const UserSchema = require("../schemas/UserSchema");


const createQuestionnaire = async (req, res) => {
    try {
        const uploadMiddleware = createUploadFields(uploadConfigs.questionnaire);

        uploadMiddleware(req, res, async function (err) {
            let processedFiles = null;

            try {
                if (err instanceof multer.MulterError) {
                    return res.status(400).json({
                        status: false,
                        message: 'File upload error',
                        error: err.message
                    });
                } else if (err) {
                    return res.status(400).json({
                        status: false,
                        message: 'Invalid file type',
                        error: err.message
                    });
                }

                if (!req.user || !req.user.id) {
                    return res.status(401).json({
                        status: false,
                        message: "User not authenticated or user ID missing."
                    });
                }

                const userId = req.user.id;

                const user = await UserSchema.findById(userId);

                console.log(user.userName);

                if (!user) {
                    return res.status(404).json({
                        status: false,
                        message: "User not found."
                    });
                }

                const updatedUploadDir = `questionnaires/`;
                processedFiles = processUploadedFiles(
                    req.files || {},
                    uploadConfigs.questionnaire.fields.map(f => f.name),
                    updatedUploadDir,
                    userId
                );

                uploadConfigs.questionnaire.fields.forEach(field => {
                    resetFileCounters(userId, field.name);
                });

                const newQuestionnaire = new Questionnaire({
                    user: userId,
                    projectApplicationSector: req.body.projectApplicationSector || "Default Sector",
                    targetedMarket: req.body.targetedMarket || ENUMS.TARGETED_MARKET[0],
                    commercialisationTimeline: req.body.commercialisationTimeline || ENUMS.COMMERCIALISATION_TIMELINE[0],
                    expectedInvestment: req.body.expectedInvestment || ENUMS.EXPECTED_INVESTMENT[0],
                    investmentType: req.body.investmentType || "Default Investment",
                    totalRevenue: req.body.totalRevenue || ENUMS.TOTAL_REVENUE[0],
                    regulatoryApproval: req.body.regulatoryApproval || ENUMS.REGULATORY_APPROVAL[0],
                    regulatoryApprovalDescription: req.body.regulatoryApprovalDescription || "",
                    landRequirement: req.body.landRequirement || ENUMS.LAND_REQUIREMENT[0],
                    landRequirementDescription: req.body.landRequirementDescription || "",
                    investorExperience: req.body.investorExperience || "",
                    expectedOtherFacilities: req.body.expectedOtherFacilities || "",
                    applicationUrl: processedFiles.applicationUrl || "",
                    researchTitle: req.body.researchTitle || "",
                    researchGaps: req.body.researchGaps || "",
                    researchObjectives: req.body.researchObjectives || "",
                    significanceForCountry: req.body.significanceForCountry || "",
                    novelty: req.body.novelty || "",
                    durationInMonths: req.body.durationInMonths || 0,
                    conductedPlaces: req.body.conductedPlaces || "",
                    marketDemand: req.body.marketDemand || "",
                    currentOutputs: req.body.currentOutputs || "",
                    expectedImpact: req.body.expectedImpact || "",
                    researchPlanUrl: processedFiles.researchPlanUrl || "",
                    totalCost: req.body.totalCost || 0,
                    requiredAssistantFromGov: req.body.requiredAssistantFromGov || "",
                    resourcesAndCollaborations: req.body.resourcesAndCollaborations || "",
                    supportingDocumentsUrl: processedFiles.supportingDocumentsUrl || "",
                    risksAndAssumptions: req.body.risksAndAssumptions || "",
                    otherDocumentUrl: processedFiles.otherDocumentUrl || "",
                    approvalStatus: req.body.approvalStatus || ENUMS.APPROVAL_STATUS[0],
                    approvalNote: req.body.approvalNote || null,
                });


                try {
                    const result = await newQuestionnaire.save().then(() => {
                        sendCustomConfirmationEmail(
                            user,
                            "Confirmation",
                            "Submission Confirmation",
                            "Thank You for contacting NIRDC. Your proposal has been received and directed to the relevant division. You can log back and check the progress of your application at any time. One of our staff members will contact you within 7 working days"
                        );
                    });
                    return res.status(201).json({
                        status: true,
                        message: 'Questionnaire created Successfully.',
                        data: result
                    });
                } catch (error) {
                    console.error("Error saving questionnaire:", error);
                    throw error;
                }

            } catch (error) {
                if (req.user && req.user.id) {
                    uploadConfigs.questionnaire.fields.forEach(field => {
                        resetFileCounters(req.user.id, field.name);
                    });
                }

                if (processedFiles) {
                    const allUploadedFiles = Object.values(processedFiles).flat();
                    cleanupFiles(allUploadedFiles, uploadConfigs.questionnaire.uploadDir);
                }

                return res.status(500).json({
                    status: false,
                    message: 'Error creating questionnaire',
                    error: error.message
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Server error',
            error: error.message
        });
    }
};


const updateQuestionnaire = async (req, res) => {
    const {id} = req.params;

    try {
        const uploadMiddleware = createUploadFields(uploadConfigs.questionnaire);

        uploadMiddleware(req, res, async function (err) {
            let processedFiles = null;

            try {
                if (err instanceof multer.MulterError) {
                    return res.status(400).json({
                        status: false,
                        message: 'File upload error',
                        error: err.message
                    });
                } else if (err) {
                    return res.status(400).json({
                        status: false,
                        message: 'Invalid file type',
                        error: err.message
                    });
                }

                const questionnaire = await Questionnaire.findById(id);
                if (!questionnaire) {
                    return res.status(404).json({
                        status: false,
                        message: 'Questionnaire not found'
                    });
                }

                if (!req.user || req.user.id !== questionnaire.user.toString()) {
                    return res.status(403).json({
                        status: false,
                        message: 'Unauthorized access'
                    });
                }

                const userId = req.user.id;
                const updatedUploadDir = `questionnaires/${userId}`;
                processedFiles = processUploadedFiles(
                    req.files || {},
                    uploadConfigs.questionnaire.fields.map(f => f.name),
                    updatedUploadDir,
                    userId
                );

                const fieldsToUpdate = ['applicationUrl', 'researchPlanUrl', 'supportingDocumentsUrl', 'otherDocumentUrl'];
                fieldsToUpdate.forEach(field => {
                    if (processedFiles[field]?.length > 0 && questionnaire[field]?.length > 0) {
                        cleanupFiles(questionnaire[field], uploadConfigs.questionnaire.uploadDir);
                    }
                });

                const updatedFields = {
                    projectApplicationSector: req.body.projectApplicationSector,
                    targetedMarket: req.body.targetedMarket || ENUMS.TARGETED_MARKET[0],
                    commercialisationTimeline: req.body.commercialisationTimeline || ENUMS.COMMERCIALISATION_TIMELINE[0],
                    expectedInvestment: req.body.expectedInvestment || ENUMS.EXPECTED_INVESTMENT[0],
                    investmentType: req.body.investmentType,
                    totalRevenue: req.body.totalRevenue || ENUMS.TOTAL_REVENUE[0],
                    regulatoryApproval: req.body.regulatoryApproval || ENUMS.REGULATORY_APPROVAL[0],
                    regulatoryApprovalDescription: req.body.regulatoryApprovalDescription,
                    landRequirement: req.body.landRequirement || ENUMS.LAND_REQUIREMENT[0],
                    landRequirementDescription: req.body.landRequirementDescription,
                    investorExperience: req.body.investorExperience,
                    expectedOtherFacilities: req.body.expectedOtherFacilities,
                    applicationUrl: processedFiles.applicationUrl || questionnaire.applicationUrl,
                    researchTitle: req.body.researchTitle,
                    researchGaps: req.body.researchGaps,
                    researchObjectives: req.body.researchObjectives,
                    significanceForCountry: req.body.significanceForCountry,
                    novelty: req.body.novelty,
                    durationInMonths: req.body.durationInMonths || 0,
                    conductedPlaces: req.body.conductedPlaces,
                    marketDemand: req.body.marketDemand,
                    currentOutputs: req.body.currentOutputs,
                    expectedImpact: req.body.expectedImpact,
                    researchPlanUrl: processedFiles.researchPlanUrl || questionnaire.researchPlanUrl,
                    totalCost: req.body.totalCost || 0,
                    requiredAssistantFromGov: req.body.requiredAssistantFromGov,
                    resourcesAndCollaborations: req.body.resourcesAndCollaborations,
                    supportingDocumentsUrl: processedFiles.supportingDocumentsUrl || questionnaire.supportingDocumentsUrl,
                    risksAndAssumptions: req.body.risksAndAssumptions,
                    otherDocumentUrl: processedFiles.otherDocumentUrl || questionnaire.otherDocumentUrl,
                    approvalStatus: req.body.approvalStatus || ENUMS.APPROVAL_STATUS[0],
                    approvalNote: req.body.approvalNote || null,
                };

                const result = await Questionnaire.updateOne({_id: id}, {$set: updatedFields});

                if (result.modifiedCount > 0) {
                    return res.status(200).json({
                        status: true,
                        message: 'Questionnaire updated Successfully'
                    });
                } else {
                    return res.status(400).json({
                        status: false,
                        message: 'No changes made, try again'
                    });
                }
            } catch (error) {
                if (processedFiles) {
                    const allUploadedFiles = Object.values(processedFiles).flat();
                    cleanupFiles(allUploadedFiles, uploadConfigs.questionnaire.uploadDir);
                }

                return res.status(500).json({
                    status: false,
                    message: 'Error updating questionnaire',
                    error: error.message
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const updateQuestionnaireStatus = (req, res) => {
    const {id} = req.params;
    Questionnaire.updateOne({_id: id}, {
        $set: {
            approvalStatus: req.body.approvalStatus,
            approvalNote: req.body.approvalNote
        }
    })
        .then(result => {
            if (result.modifiedCount > 0) {
                res.status(200).json({status: true, message: 'Questionnaire updated Successfully'});
            } else {
                res.status(400).json({status: false, message: 'No changes made, try again'});
            }
        })
        .catch((error) => {
            res.status(500).json({
                status: false,
                message: 'Error updating questionnaire',
                error: error.message
            });
        });
};

const getAllQuestionnaires = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    try {
        const result = await Questionnaire.find()
            .skip(skip)
            .limit(limit);

        const totalCount = await Questionnaire.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            status: true,
            message: 'All Questionnaires',
            data: result,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Error fetching questionnaires',
            error: error.message,
        });
    }
};

const getQuestionnaireById = async (req, res) => {
    const {id} = req.params;

    Questionnaire.findById({_id: id}).then(result => {
        if (result == null) {
            res.status(200).json({
                status: false,
                message: 'Questionnaire Not Found',
            });
        } else {
            res.status(200).json({
                status: true,
                message: 'Questionnaire',
                data: result
            });
        }
    }).catch((error) => {
        res.status(500).json(error);
    })
};

const getQuestionnaireByApprovalStatus = async (req, res) => {
    let approvalStatus = req.params.approvalStatus;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    try {
        const result = await Questionnaire.find({approvalStatus: approvalStatus})
            .skip(skip)
            .limit(limit);
        const totalCount = await Questionnaire.countDocuments({approvalStatus: approvalStatus});
        const totalPages = Math.ceil(totalCount / limit);
        if (!result || result.length === 0) {
            return res.status(200).json({
                status: false,
                message: 'Questionnaires Not Found',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Questionnaires found',
                data: result,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalCount,
                    itemsPerPage: limit
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Error fetching questionnaires',
            error: error.message,
        });
    }
};

const getQuestionnairesByUser = async (req, res) => {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    try {
        const result = await Questionnaire.find({user: userId})
            .skip(skip)
            .limit(limit);

        const totalCount = await Questionnaire.countDocuments({user: userId});
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            status: true,
            message: 'Questionnaires By User',
            data: result,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Error fetching questionnaires by user',
            error: error.message,
        });
    }
};

const getQuestionnairesByEmail = async (req, res) => {
    const userEmail = req.query.email;
    console.log(userEmail);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    try {
        const user = await User.findOne({email: userEmail});

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        const result = await Questionnaire.find({user: user._id})
            .skip(skip)
            .limit(limit);

        const totalCount = await Questionnaire.countDocuments({user: user._id});
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            status: true,
            message: 'Questionnaires By Email',
            data: result,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Error fetching questionnaires by email',
            error: error.message,
        });
    }
};

const deleteQuestionnaire = async (req, res) => {
    const {id} = req.params;
    try {
        const questionnaire = await Questionnaire.findById(id);
        if (!questionnaire) {
            return res.status(404).json({
                status: false,
                message: 'Questionnaire not found.',
            });
        }

        const filesToDelete = [
            ...questionnaire.applicationUrl || [],
            ...questionnaire.researchPlanUrl || [],
            ...questionnaire.supportingDocumentsUrl || [],
            ...questionnaire.otherDocumentUrl || [],
        ];

        if (filesToDelete.length > 0) {
            await deleteFiles(filesToDelete);
        } else {
            console.log('No files to delete.');
        }

        const result = await Questionnaire.deleteOne({_id: id});
        if (result.deletedCount > 0) {
            res.status(200).json({
                status: true,
                message: 'Questionnaire and associated files deleted Successfully.',
            });
        } else {
            res.status(500).json({
                status: false,
                message: 'Error deleting questionnaire.',
            });
        }
    } catch (error) {
        console.error('Error in deleteQuestionnaire:', error);
        res.status(500).json({
            status: false,
            message: 'An unexpected error occurred.',
            error: error.message,
        });
    }
};


module.exports = {
    createQuestionnaire,
    updateQuestionnaire,
    updateQuestionnaireStatus,
    getAllQuestionnaires,
    getQuestionnaireById,
    getQuestionnaireByApprovalStatus,
    getQuestionnairesByUser,
    getQuestionnairesByEmail,
    deleteQuestionnaire
}