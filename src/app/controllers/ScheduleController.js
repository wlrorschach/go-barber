import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Appointments from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const { page, date } = req.query;

    try {
      const checkProvider = await User.findOne({ where: { provider: true } });

      if (!checkProvider) {
        return res.status(401).json({ error: 'Use is not a provider' });
      }

      const parsedDate = parseISO(date);

      const appointments = await Appointments.findAll({
        where: {
          provider_id: req.userId,
          canceled_at: null,
          date: {
            [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
          },
        },
        order: ['date'],
        offset: (page - 1) * 20,
        limit: 20,
        attributes: ['id', 'date'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        ],
      });

      return res.json(appointments);
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching schedule ' });
    }
  }
}

export default new ScheduleController();
