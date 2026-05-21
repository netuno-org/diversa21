import request from "supertest";

const NETUNO_URL = 'http://localhost:9000/services';

test('login with user Test', async () => {
  const response = await request(NETUNO_URL)
    .put('/_auth')
    .set('Content-Type', 'application/json')
    .set('Accept', '*/*')
    .send({
      username: 'test',
      password: '12345678',
      jwt: true
    })
    .expect('Content-Type', 'application/json')
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty('access_token');
});
