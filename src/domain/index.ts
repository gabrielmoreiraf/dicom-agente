export type { ComunidadeItem } from "./comunidades";
export type { DiagnosisRecord, DiagnosisStatus } from "./diagnosis";
export {
  DIAGNOSIS_STATUSES,
} from "./diagnosis";
export type {
  DiagnosisCreateRequestBody,
  DiagnosisRemoteResponseBody,
} from "./diagnosisApi";
export {
  applyRemoteSuccessToLocal,
  mapDiagnosisRecordToApiRequest,
} from "./diagnosisApi";
