const Questionnaire = require('../schemas/QuestionnaireSchema');
const User = require('../schemas/UserSchema');
const ENUMS = require('../schemas/enums/QuestionnaireEnums');

const createQuestionnaire = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated or user ID missing."
        });
    }
    const newQuestionnaire = new Questionnaire({
        user: req.user.id,
        projectApplicationSector: req.body.projectApplicationSector,
        targetedMarket: req.body.targetedMarket || ENUMS.TARGETED_MARKET[0],
        commercialisationTimeline: req.body.commercialisationTimeline || ENUMS.COMMERCIALISATION_TIMELINE[0],
        expectedInvestment: req.body.expectedInvestment || ENUMS.EXPECTED_INVESTMENT[0],
        investmentType: req.body.investmentType ,
        totalRevenue: req.body.totalRevenue || ENUMS.TOTAL_REVENUE[0],
        regulatoryApproval: req.body.regulatoryApproval || ENUMS.REGULATORY_APPROVAL[0],
        regulatoryApprovalDescription: req.body.regulatoryApprovalDescription ,
        landRequirement: req.body.landRequirement || ENUMS.LAND_REQUIREMENT[0],
        landRequirementDescription: req.body.landRequirementDescription ,
        investorExperience: req.body.investorExperience ,
        expectedOtherFacilities: req.body.expectedOtherFacilities ,
        applicationUrl: req.body.applicationUrl,
        researchTitle: req.body.researchTitle ,
        researchGaps: req.body.researchGaps ,
        researchObjectives: req.body.researchObjectives,
        significanceForCountry: req.body.significanceForCountry ,
        novelty: req.body.novelty ,
        durationInMonths: req.body.durationInMonths || 0,
        conductedPlaces: req.body.conductedPlaces,
        marketDemand: req.body.marketDemand ,
        currentOutputs: req.body.currentOutputs,
        expectedImpact: req.body.expectedImpact ,
        researchPlanUrl: req.body.researchPlanUrl,
        totalCost: req.body.totalCost || 0,
        requiredAssistantFromGov: req.body.requiredAssistantFromGov ,
        resourcesAndCollaborations: req.body.resourcesAndCollaborations ,
        supportingDocumentsUrl: req.body.supportingDocumentsUrl,
        risksAndAssumptions: req.body.risksAndAssumptions,
        otherDocumentUrl: req.body.otherDocumentUrl,
        approvalStatus: req.body.approvalStatus || ENUMS.APPROVAL_STATUS[0],
        approvalNote: req.body.approvalNote || null,

    });

    newQuestionnaire.save()
        .then(result => {
            res.status(201).json({
                success: true,
                message: 'Questionnaire created successfully.',
                data: result
            });
        })
        .catch((error) => {
            res.status(500).json({
                success: false,
                message: 'Error creating questionnaire',
                error: error.message
            });
        });
};

const updateQuestionnaire = (req, res) => {
    const {id} = req.params;

    Questionnaire.updateOne({_id: id}, {
        $set: {
            projectApplicationSector: req.body.projectApplicationSector,
            targetedMarket: req.body.targetedMarket || ENUMS.TARGETED_MARKET[0],
            commercialisationTimeline: req.body.commercialisationTimeline || ENUMS.COMMERCIALISATION_TIMELINE[0],
            expectedInvestment: req.body.expectedInvestment || ENUMS.EXPECTED_INVESTMENT[0],
            investmentType: req.body.investmentType ,
            totalRevenue: req.body.totalRevenue || ENUMS.TOTAL_REVENUE[0],
            regulatoryApproval: req.body.regulatoryApproval || ENUMS.REGULATORY_APPROVAL[0],
            regulatoryApprovalDescription: req.body.regulatoryApprovalDescription ,
            landRequirement: req.body.landRequirement || ENUMS.LAND_REQUIREMENT[0],
            landRequirementDescription: req.body.landRequirementDescription ,
            investorExperience: req.body.investorExperience ,
            expectedOtherFacilities: req.body.expectedOtherFacilities ,
            applicationUrl: req.body.applicationUrl,
            researchTitle: req.body.researchTitle ,
            researchGaps: req.body.researchGaps ,
            researchObjectives: req.body.researchObjectives,
            significanceForCountry: req.body.significanceForCountry ,
            novelty: req.body.novelty ,
            durationInMonths: req.body.durationInMonths || 0,
            conductedPlaces: req.body.conductedPlaces,
            marketDemand: req.body.marketDemand ,
            currentOutputs: req.body.currentOutputs,
            expectedImpact: req.body.expectedImpact ,
            researchPlanUrl: req.body.researchPlanUrl,
            totalCost: req.body.totalCost || 0,
            requiredAssistantFromGov: req.body.requiredAssistantFromGov ,
            resourcesAndCollaborations: req.body.resourcesAndCollaborations ,
            supportingDocumentsUrl: req.body.supportingDocumentsUrl,
            risksAndAssumptions: req.body.risksAndAssumptions,
            otherDocumentUrl: req.body.otherDocumentUrl,
            approvalStatus: req.body.approvalStatus || ENUMS.APPROVAL_STATUS[0],
            approvalNote: req.body.approvalNote || null,
        }
    })
        .then(result => {
            if (result.modifiedCount > 0) {
                res.status(200).json({success: true, message: 'Questionnaire updated successfully'});
            } else {
                res.status(400).json({success: false, message: 'No changes made, try again'});
            }
        })
        .catch((error) => {
            res.status(500).json({
                success: false,
                message: 'Error updating questionnaire',
                error: error.message
            });
        });
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
                res.status(200).json({success: true, message: 'Questionnaire updated successfully'});
            } else {
                res.status(400).json({success: false, message: 'No changes made, try again'});
            }
        })
        .catch((error) => {
            res.status(500).json({
                success: false,
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
            success: true,
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
            success: false,
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
                success: false,
                message: 'Questionnaire Not Found',
            });
        } else {
            res.status(200).json({
                success: true,
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
        const result = await Questionnaire.find({ approvalStatus: approvalStatus })
            .skip(skip)
            .limit(limit);
        const totalCount = await Questionnaire.countDocuments({ approvalStatus: approvalStatus });
        const totalPages = Math.ceil(totalCount / limit);
        if (!result || result.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'Questionnaires Not Found',
            });
        } else {
            return res.status(200).json({
                success: true,
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
            success: false,
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
        const result = await Questionnaire.find({ user: userId })
            .skip(skip)
            .limit(limit);

        const totalCount = await Questionnaire.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            success: true,
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
            success: false,
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
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const result = await Questionnaire.find({ user: user._id })
            .skip(skip)
            .limit(limit);

        const totalCount = await Questionnaire.countDocuments({ user: user._id });
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            success: true,
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
            success: false,
            message: 'Error fetching questionnaires by email',
            error: error.message,
        });
    }
};

const deleteQuestionnaire = async (req, res) => {
    const {id} = req.params;
    Questionnaire.deleteOne({_id: id}).then(result => {
        if (result.deletedCount > 0) {
            res.status(200).json({
                success: true,
                message: 'Questionnaire deleted successfully.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error deleting questionnaire'
            });
        }
    }).catch((error) => {
        res.status(500).json(error);
    });
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