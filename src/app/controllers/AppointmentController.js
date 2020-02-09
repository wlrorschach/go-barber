import { isBefore, parseISO, startOfHour } from 'date-fns';
import * as Yup from 'yup';
import Appointment from '../models/Appointment';
import File from '../models/File';
import User from '../models/User';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 20,
      attributes: ['id', 'date'],
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
            },
          ],
        },
      ],
    });

    res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object({
      date: Yup.date().required(),
      provider_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { userId: user_id } = req;
    const { date, provider_id } = req.body;

    const userExist = await User.findOne({
      where: { provider: true, id: provider_id },
    });

    if (!userExist) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    /**
     * Check date is not before
     */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past date is not permited!' });
    }

    /**
     * Check date availability
     */

    const availability = await Appointment.findOne({
      where: { provider_id, canceled_at: null, date },
    });

    if (availability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    const appoint = await Appointment.create({
      user_id,
      date: hourStart,
      provider_id,
    });
    return res.json(appoint);
  }
}

export default new AppointmentController();
