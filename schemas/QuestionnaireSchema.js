const mongoose = require('mongoose');
const ENUMS = require('./enums/QuestionnaireEnums');

const QuestionnaireSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true},
    projectApplicationSector: {type: String, required: true},
    targetedMarket: {type: String, required: true, enum: ENUMS.TARGETED_MARKET},
    commercialisationTimeline: {
        type: String,
        required: true,
        enum: ENUMS.COMMERCIALISATION_TIMELINE
    },
    expectedInvestment: {
        type: String,
        required: true,
        enum: ENUMS.EXPECTED_INVESTMENT
    },
    investmentType: {type: String, required: true},
    totalRevenue: {
        type: String,
        required: true,
        enum: ENUMS.TOTAL_REVENUE
    },
    regulatoryApproval: {type: String, required: true, enum: ENUMS.REGULATORY_APPROVAL},
    regulatoryApprovalDescription: {type: String},
    landRequirement: {type: String, required: true, enum: ENUMS.LAND_REQUIREMENT},
    landRequirementDescription: {type: String},
    investorExperience: {type: String},
    expectedOtherFacilities: {type: String},
    applicationUrl: [{type: String, required: true}],
    researchTitle: {type: String, required: true},
    researchGaps: {type: String, required: true},
    researchObjectives: {type: String, required: true},
    significanceForCountry: {type: String, required: true},
    novelty: {type: String, required: true},
    durationInMonths: {type: Number, required: true},
    conductedPlaces: {type: String, required: true},
    marketDemand: {type: String, required: true},
    currentOutputs: {type: String, required: true},
    expectedImpact: {type: String, required: true},
    researchPlanUrl: [{type: String, required: true}],
    totalCost: {type: Number, required: true},
    requiredAssistantFromGov: {type: String, required: true},
    resourcesAndCollaborations: {type: String, required: true},
    supportingDocumentsUrl: [{type: String, required: true}],
    risksAndAssumptions: {type: String, required: true},
    otherDocumentUrl: [{type: String, required: true}],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    approvalStatus: {type: String, enum: ENUMS.APPROVAL_STATUS},
    approvalNote: {type: String},
});

module.exports = mongoose.model('Questionnaire', QuestionnaireSchema);
