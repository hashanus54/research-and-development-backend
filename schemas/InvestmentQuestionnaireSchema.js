const mongoose = require('mongoose');

const InvestmentQuestionnaireSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true},

    projectTitle: {
        type: String,
        required: true,
        trim: true
    },
    investmentObjectives: {
        type: String,
        required: true,
        maxlength: 800
    },
    marketDemand: {
        type: String,
        required: true,
        maxlength: 800
    },
    governmentAssistance: {
        funds: { type: Boolean, default: false },
        regulatoryApprovals: { type: Boolean, default: false },
        land: { type: Boolean, default: false },
        infrastructureAccess: { type: Boolean, default: false },
        technicalAssistance: { type: Boolean, default: false },
        industryPartnerships: { type: Boolean, default: false },
        ipPatentApplications: { type: Boolean, default: false },
        other: {
            selected: { type: Boolean, default: false },
            description: { type: String, trim: true }
        }
    },
    researchGaps: {
        type: String,
        required: true,
        maxlength: 400
    },
    researchObjectives: {
        type: String,
        required: true,
        maxlength: 800
    },
    totalProjectCost: {
        type: Number,
        required: true,
        min: 0
    },
    countrySignificance: {
        type: String,
        required: true,
        maxlength: 400
    },
    currentOutputs: {
        type: String,
        required: true
    },
    technologyReadinessLevel: {
        type: String,
        required: true,
        enum: ['TRL 1', 'TRL 2', 'TRL 3', 'TRL 4', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9']
    },
    publications: {
        type: String
    },
    resourcesCollaborations: {
        type: String
    },
    riskAssumptions: {
        type: String,
        maxlength: 200
    },
    projectFile: {
        filename: String,
        path: String,
        size: Number,
        mimetype: {
            type: String,
            enum: ['application/pdf']
        }
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InvestmentQuestionnaire', InvestmentQuestionnaireSchema);
