import { model, Schema } from 'mongoose';

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    plan: { type: String, enum: ['STARTER', 'GROWTH', 'SCALE'], default: 'STARTER' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Organization = model('Organization', organizationSchema);
