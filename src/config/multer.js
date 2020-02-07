import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'temp', 'uploads'),
    filename: (req, file, cbk) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) {
          return cbk(err);
        }

        return cbk(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
