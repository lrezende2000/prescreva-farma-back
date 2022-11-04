import * as yup from "yup";
import moment from "moment";

export const createAppointmentSchema = yup
  .object()
  .shape({
    start: yup.date().required("Horário inicial é obrigatório").typeError("Data no formato errado"),
    end: yup
      .date()
      .min(yup.ref('start'))
      .typeError("Data no formato errado")
      .required('Horário final é obrigatório')
      .test('same-day-as-start', 'Horário final deve ser no mesmo dia', (value, context) => {
        if (value && context.parent.start) {
          const start = moment(context.parent.start);

          return moment(value).format('YYYY-MM-DD') === start.format('YYYY-MM-DD');
        }

        return true;
      }),
    patientId: yup.number().integer().required("Paciente é obrigatório"),
    professionalId: yup
      .number()
      .integer()
      .required("Profissional é obrigatório"),
  }).noUnknown();
