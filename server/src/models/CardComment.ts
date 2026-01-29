import mongoose, { Document, Schema } from 'mongoose';

export interface ICardComment extends Document {
  cardCode: string;
  userId: string; // Identificador único del usuario
  userName?: string; // Nombre opcional del usuario
  text: string;
  createdAt: Date;
}

const CardCommentSchema = new Schema<ICardComment>({
  cardCode: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    default: 'Anónimo',
  },
  text: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CardCommentSchema.index({ cardCode: 1, createdAt: -1 });

export const CardComment = mongoose.model<ICardComment>('CardComment', CardCommentSchema);
