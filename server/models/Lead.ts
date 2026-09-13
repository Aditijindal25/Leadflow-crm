import { model, Schema } from 'mongoose';

const interactionSchema = new Schema(
  {
    type: { type: String, enum: ['CALL', 'EMAIL', 'MEETING', 'NOTE'], required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    date: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const leadSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, maxlength: 30, index: true },
    company: { type: String, trim: true, maxlength: 120 },
    source: { type: String, enum: ['WEBSITE', 'REFERRAL', 'LINKEDIN', 'INSTAGRAM', 'EMAIL', 'ADVERTISEMENT', 'OTHER'], default: 'WEBSITE', index: true },
    projectType: { type: String, trim: true, maxlength: 80 },
    budgetRange: { type: String, trim: true, maxlength: 50 },
    preferredContact: { type: String, enum: ['EMAIL', 'PHONE', 'WHATSAPP', 'ANY'], default: 'EMAIL' },
    preferredContactDetail: { type: String, trim: true, maxlength: 160 },
    message: { type: String, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'LOST', 'ON_HOLD'], default: 'NEW', index: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM', index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    followUpDate: { type: Date, index: true },
    conversionDate: Date,
    leadScore: { type: Number, min: 0, max: 100, default: 0, index: true },
    temperature: { type: String, enum: ['HOT', 'WARM', 'COLD'], default: 'COLD', index: true },
    intent: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'], default: 'UNKNOWN' },
    engagement: { type: Number, min: 0, max: 100, default: 0 },
    conversionProbability: { type: Number, min: 0, max: 1, default: 0 },
    estimatedValue: { type: Number, min: 0, default: 0 },
    nextAction: { type: String, trim: true, maxlength: 240 },
    aiInsight: { type: Schema.Types.Mixed },
    interactions: [interactionSchema],
  },
  { timestamps: true },
);

leadSchema.index({ createdAt: -1 });
leadSchema.index({ organizationId: 1, createdAt: -1 });
leadSchema.index({ organizationId: 1, status: 1, priority: 1 });
leadSchema.index({ name: 'text', email: 'text', company: 'text', phone: 'text' });

export const Lead = model('Lead', leadSchema);
