import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, trim: true, maxlength: 100, default: 'LeadFlow Admin' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    teamIds: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    role: { type: String, enum: ['OWNER', 'ADMIN', 'MANAGER', 'SALES_AGENT', 'VIEWER'], default: 'SALES_AGENT' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = model('User', userSchema);
