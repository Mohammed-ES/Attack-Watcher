import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 15 },
    { duration: '30s', target: 40 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

const RAW_URL = (__ENV.STAGING_URL || 'http://localhost:8000').replace(/\/$/, '');
const API_BASE = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;
const STUDENT_TOKEN = __ENV.STUDENT_TOKEN || '';

const SAMPLE_JSON = JSON.stringify({
  etudiant: 'K6_TEST',
  sklearn_version: '1.6.1',
  partie3_modele_etudiant: { vp: 90, fp: 5, vn: 95, fn: 10, recall: 0.9, taux_fp: 0.05 },
  partie4_modele_projet: { vp: 1, fp: 0, vn: 1, fn: 0, recall: 1.0, taux_fp: 0.0 },
  partie5_anomalie: { vp: 40, fp: 2, vn: 98, fn: 10, recall: 0.8, taux_fp: 0.02 },
  partie6_phishing: { vp: 45, fp: 1, vn: 99, fn: 5, recall: 0.9, taux_fp: 0.01 },
  partie7_application: { verdict_normal: 'Normal', verdict_ddos: 'DDoS' },
});

const SAMPLE_CSV =
  'Flow Duration,Total Fwd Packets,Total Backward Packets,' +
  'Total Length of Fwd Packets,Total Length of Bwd Packets,Bwd Packet Length Std,' +
  'Flow Packets/s,Flow IAT Mean,ACK Flag Count,Label,pred_projet\n' +
  '73752313,5,9,11613,62,5.3,0.19,5673254.0,1,BENIGN,0\n' +
  '248058,2,5,20,11601,3022.5,28.2,41343.0,0,DDoS,1\n';

export default function () {
  const healthRes = http.get(`${API_BASE}/health`);
  check(healthRes, {
    'health status 200': (r) => r.status === 200,
  });

  if (STUDENT_TOKEN) {
    const featRes = http.get(`${API_BASE}/tp/test-features`, {
      headers: { Authorization: `Bearer ${STUDENT_TOKEN}` },
    });
    check(featRes, {
      'test-features status 200': (r) => r.status === 200,
    });
  }

  // Appel à /api/tp/verify avec des fichiers < 5 Mo (TP_MAX_UPLOAD_SIZE)
  const verifyPayload = {
    json_file: http.file(SAMPLE_JSON, 'resultats_TP_K6.json', 'application/json'),
    csv_file: http.file(SAMPLE_CSV, 'predictions_TP_K6.csv', 'text/csv'),
  };
  const verifyParams = STUDENT_TOKEN
    ? { headers: { Authorization: `Bearer ${STUDENT_TOKEN}` } }
    : {};

  const verifyRes = http.post(`${API_BASE}/tp/verify`, verifyPayload, verifyParams);
  check(verifyRes, {
    'verify status 200': (r) => r.status === 200,
  });

  sleep(1);
}
