import { isBefore, parseISO, startOfHour, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import * as Yup from 'yup';
import Appointment from '../models/Appointment';
import File from '../models/File';
import User from '../models/User';
import Notification from '../schemas/Notification';

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
      where: { provider_id, canceled_at: null, date: hourStart },
    });

    if (availability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    /**
     * Verificando se o usuario esta realizando um agendamento consigo msm
     */
    if (provider_id === user_id) {
      return res
        .status(400)
        .json({ error: 'Cant make a appointment whit yourself' });
    }

    const appoint = await Appointment.create({
      user_id,
      date: hourStart,
      provider_id,
    });

    /**
     * Notify appointment provider
     */
    const user = await User.findOne({ where: { id: req.userId } });
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    const notification = await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    return res.json({ notification, appoint });
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id);

    if (appointment.user_id !== req.userId) {
      return res
        .status(400)
        .json({ error: "You don't have permissio to cancel this appointment" });
    }

    const dateSub = subHours(appointment.date, 2);
    const now = new Date();
    if (isBefore(dateSub, now)) {
      return res.status(400).json({
        error: 'You can only cancel appointments with 2 hours advance',
      });
    }

    appointment.canceled_at = now;

    await appointment.save();

    return res.json(appointment);
  }
}

export default new AppointmentController();
