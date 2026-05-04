import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,        // 100 virtual users
  duration: '30s', // 30 seconds tak
};

export default function () {
  const res = http.post(
    'https://flash-sale-engine-backend.onrender.com/buy/1'
  );
  check(res, {
    'status is 200 or 400': (r) => r.status === 200 || r.status === 400,
  });
}