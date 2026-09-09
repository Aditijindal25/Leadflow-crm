import { model, Schema } from 'mongoose';

const teamSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

teamSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const Team = model('Team', teamSchema);
