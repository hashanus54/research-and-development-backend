const Questionnaire = require('../schemas/QuestionnaireSchema');
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
        investmentType: req.body.investmentType || "Default Investment Type",
        totalRevenue: req.body.totalRevenue || ENUMS.TOTAL_REVENUE[0],
        regulatoryApproval: req.body.regulatoryApproval || ENUMS.REGULATORY_APPROVAL[0],
        regulatoryApprovalDescription: req.body.regulatoryApprovalDescription || "",
        landRequirement: req.body.landRequirement || ENUMS.LAND_REQUIREMENT[0],
        landRequirementDescription: req.body.landRequirementDescription || "",
        investorExperience: req.body.investorExperience || "",
        expectedOtherFacilities: req.body.expectedOtherFacilities || "",
        applicationUrl: req.body.applicationUrl || [],
        researchTitle: req.body.researchTitle || "Default Research Title",
        researchGaps: req.body.researchGaps || "Default Research Gaps",
        researchObjectives: req.body.researchObjectives || "Default Research Objectives",
        significanceForCountry: req.body.significanceForCountry || "Default Significance",
        novelty: req.body.novelty || "Default Novelty",
        durationInMonths: req.body.durationInMonths || 0,
        conductedPlaces: req.body.conductedPlaces || "Default Places",
        marketDemand: req.body.marketDemand || "Default Market Demand",
        currentOutputs: req.body.currentOutputs || "Default Outputs",
        expectedImpact: req.body.expectedImpact || "Default Impact",
        researchPlanUrl: req.body.researchPlanUrl || [],
        totalCost: req.body.totalCost || 0,
        requiredAssistantFromGov: req.body.requiredAssistantFromGov || "Default Assistance",
        resourcesAndCollaborations: req.body.resourcesAndCollaborations || "Default Resources",
        supportingDocumentsUrl: req.body.supportingDocumentsUrl || [],
        risksAndAssumptions: req.body.risksAndAssumptions || "Default Risks",
        otherDocumentUrl: req.body.otherDocumentUrl || [],
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
            investmentType: req.body.investmentType || "Default Investment Type",
            totalRevenue: req.body.totalRevenue || ENUMS.TOTAL_REVENUE[0],
            regulatoryApproval: req.body.regulatoryApproval || ENUMS.REGULATORY_APPROVAL[0],
            regulatoryApprovalDescription: req.body.regulatoryApprovalDescription || "",
            landRequirement: req.body.landRequirement || ENUMS.LAND_REQUIREMENT[0],
            landRequirementDescription: req.body.landRequirementDescription || "",
            investorExperience: req.body.investorExperience || "",
            expectedOtherFacilities: req.body.expectedOtherFacilities || "",
            applicationUrl: req.body.applicationUrl || [],
            researchTitle: req.body.researchTitle || "Default Research Title",
            researchGaps: req.body.researchGaps || "Default Research Gaps",
            researchObjectives: req.body.researchObjectives || "Default Research Objectives",
            significanceForCountry: req.body.significanceForCountry || "Default Significance",
            novelty: req.body.novelty || "Default Novelty",
            durationInMonths: req.body.durationInMonths || 0,
            conductedPlaces: req.body.conductedPlaces || "Default Places",
            marketDemand: req.body.marketDemand || "Default Market Demand",
            currentOutputs: req.body.currentOutputs || "Default Outputs",
            expectedImpact: req.body.expectedImpact || "Default Impact",
            researchPlanUrl: req.body.researchPlanUrl || [],
            totalCost: req.body.totalCost || 0,
            requiredAssistantFromGov: req.body.requiredAssistantFromGov || "Default Assistance",
            resourcesAndCollaborations: req.body.resourcesAndCollaborations || "Default Resources",
            supportingDocumentsUrl: req.body.supportingDocumentsUrl || [],
            risksAndAssumptions: req.body.risksAndAssumptions || "Default Risks",
            otherDocumentUrl: req.body.otherDocumentUrl || [],
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
    Questionnaire.find().then(result => {
        res.status(200).json({
            success: true,
            message: 'All Questionnaires',
            data: result
        });
    }).catch((error) => {
        res.status(500).json(error);
    });
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
    const {status} = req.params;

    Questionnaire.find({approvalStatus: status}).then(result => {
        if (result == null) {
            res.status(200).json({
                success: false,
                message: 'Questionnaires Not Found',
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Questionnaires',
                data: result
            });
        }
    }).catch((error) => {
        res.status(500).json(error);
    })
};

const getQuestionnairesByUser = async (req, res) => {
    const userId = req.user.id;
    console.log(userId)

    Questionnaire.find({user: userId}).then(result => {
        res.status(200).json({
            success: true,
            message: 'Questionnaires By User',
            data: result
        });
    }).catch((error) => {
        res.status(500).json(error);
    })
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
    deleteQuestionnaire
}