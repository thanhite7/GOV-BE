import mongoose from 'mongoose';

const healthDeclarationSchema = new mongoose.Schema({
  name: String,
  temperature: Number,
  symptoms: [String],
  contactWithInfected: Boolean,
}, {
  timestamps: true 
});

export const Declaration = mongoose.model('HealthDeclaration', healthDeclarationSchema);