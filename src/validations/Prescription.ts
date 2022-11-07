import * as yup from 'yup';

export const createPrescriptionSchema = yup.object().shape({
  professionalId: yup.number().integer("Id do profissional incorreto").required("Profissional é obrigatório"),
  patientId: yup.number().integer("Id do paciente incorreto").required("Paciente é obrigatório"),
  aditionalInfos: yup.string(),
  nonPharmacologicalTherapy: yup.string(),
  medicines: yup.array(yup.object().shape({
    medicineId: yup.number().integer("Id do fármaco incorreto").required("Fármaco é obrigatório"),
    concentration: yup.string().required("Concentração é obrigatória"),
    instructions: yup.string().required("Instrução é obrigatória"),
    administrationForm: yup.string().oneOf(['Uso Interno', 'Uso Externo'], "Forma de administração só pode ser 'Uso Interno' ou 'Uso Externo'").required("Forma de administração é obrigatória"),
  }).noUnknown()).required("Fármacos são obrigatórios")
});