import * as yup from 'yup';

export const createPrescriptionSchema = yup.object().shape({
  professionalId: yup.number().integer("Id do profissional incorreto").required("Profissional é obrigatório"),
  patientId: yup.number().integer("Id do paciente incorreto").required("Paciente é obrigatório"),
  aditionalInfos: yup.string(),
  nonPharmacologicalTherapy: yup.string(),
  prescriptionMedicines: yup.array(yup.object().shape({
    medicineId: yup.number().integer("Id do fármaco incorreto").required("Fármaco é obrigatório"),
    concentration: yup.string().required("Concentração é obrigatória"),
    instructions: yup.string().required("Instrução é obrigatória"),
    administrationForm: yup.string().oneOf(['Uso oral', 'Uso externo'], "Forma de administração só pode ser 'Uso oral' ou 'Uso externo'").required("Forma de administração é obrigatória"),
  })).required("Fármacos são obrigatórios")
});