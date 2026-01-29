import mongoose, { Document, Schema } from 'mongoose';

export interface ICardVote extends Document {
  cardCode: string;
  userId: string; // Identificador único del usuario (IP, localStorage, etc.)
  createdAt: Date;
}

const CardVoteSchema = new Schema<ICardVote>({
  cardCode: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Índice compuesto para evitar votos duplicados
CardVoteSchema.index({ cardCode: 1, userId: 1 }, { unique: true });

export const CardVote = mongoose.model<ICardVote>('CardVote', CardVoteSchema);
