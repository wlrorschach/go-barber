// importando o mongoose, ORM para utilizacao do MongoDb
import mongoose from 'mongoose';

// Criando o schema de Notificacao, q sera criado a partir do contrutor chamado por mongoose.Schema
const NotificationSchema = new mongoose.Schema(
  /**
   * Desclara se todos os dados que serao contidos no Schema, com propridades como
   *
   * required: q dira se o campo é obrigatorio
   * type: imformando o tipo do campo
   * default: valor padrao do campo, caso este nao seja informado no momento da inclusao
   */
  {
    content: {
      type: String,
      required: true,
    },
    user: { type: Number, required: true },
    read: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', NotificationSchema);
