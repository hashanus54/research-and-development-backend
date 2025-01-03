const InvestmentQuestionnaire = require('../schemas/InvestmentQuestionnaireSchema');
const User = require('../schemas/UserSchema');
const {
    createUploadFields,
    cleanupFiles,
    processUploadedFiles,
    uploadConfigs,
    resetFileCounters
} = require('../utils/FileUploadUtil');
const multer = require('multer');
const { sendCustomConfirmationEmail } = require('../utils/EmailUtil');

const createQuestionnaire = async (req, res) => {
    try {
        const uploadMiddleware = createUploadFields(uploadConfigs.investmentQuestionnaire);

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
                const user = await User.findById(userId);

                if (!user) {
                    return res.status(404).json({
                        status: false,
                        message: "User not found."
                    });
                }

                const updatedUploadDir = `investment-questionnaires/`;
                processedFiles = processUploadedFiles(
                    req.files || {},
                    uploadConfigs.investmentQuestionnaire.fields.map(f => f.name),
                    updatedUploadDir,
                    userId
                );

                uploadConfigs.investmentQuestionnaire.fields.forEach(field => {
                    resetFileCounters(userId, field.name);
                });

                const newQuestionnaire = new InvestmentQuestionnaire({
                    user: userId,
                    projectTitle: req.body.projectTitle,
                    investmentObjectives: req.body.investmentObjectives,
                    marketDemand: req.body.marketDemand,
                    governmentAssistance: {
                        funds: req.body.governmentAssistance.includes('Funds'),
                        regulatoryApprovals: req.body.governmentAssistance.includes('Regulatory approvals'),
                        land: req.body.governmentAssistance.includes('Land'),
                        infrastructureAccess: req.body.governmentAssistance.includes('Access to infrastructure/equipment'),
                        technicalAssistance: req.body.governmentAssistance.includes('Technical assistance'),
                        industryPartnerships: req.body.governmentAssistance.includes('Industry partnerships'),
                        ipPatentApplications: req.body.governmentAssistance.includes('IP/Patent applications'),
                        other: {
                            selected: req.body.governmentAssistance.includes('Other'),
                            description: req.body.governmentAssistance.includes('Other') ? req.body.governmentAssistanceOther || '' : null
                        }
                    },
                    researchGaps: req.body.researchGaps,
                    researchObjectives: req.body.researchObjectives,
                    totalProjectCost: parseFloat(req.body.totalProjectCost),
                    countrySignificance: req.body.countrySignificance,
                    currentOutputs: req.body.currentOutputs,
                    technologyReadinessLevel: req.body.technologyReadinessLevel,
                    publications: req.body.publications,
                    resourcesCollaborations: req.body.resourcesCollaborations,
                    riskAssumptions: req.body.riskAssumptions,
                    projectFile: processedFiles.projectFile || null
                });

                try {
                    const result = await newQuestionnaire.save();
                    await sendCustomConfirmationEmail(
                        user,
                        "Confirmation",
                        "Submission Confirmation",
                        "Thank You for contacting NIRDC. Your proposal has been received and directed to the relevant division. You can log back and check the progress of your application at any time. One of our staff members will contact you within 7 working days."
                    );

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
                    uploadConfigs.investmentQuestionnaire.fields.forEach(field => {
                        resetFileCounters(req.user.id, field.name);
                    });
                }

                if (processedFiles) {
                    const allUploadedFiles = Object.values(processedFiles).flat();
                    cleanupFiles(allUploadedFiles, uploadConfigs.investmentQuestionnaire.uploadDir);
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

module.exports = {
    createQuestionnaire
};