import Appointment from '../models/Appointment';

class AppointmentController {
  async store(req, res) {
    const appoint = await Appointment.create(req.body);
    return res.json(appoint);
  }
}

export default new AppointmentController();
