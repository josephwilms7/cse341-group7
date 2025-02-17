const request = require('supertest');
const express = require('express');

jest.mock('../data/database', () => ({
  getDatabase: () => ({
    db: () => ({
      collection: (name) => ({
        find: () => ({
          toArray: () => Promise.resolve([
            name === "dogs" 
              ? { _id: "1", name: "Test Dog", gender: "male", age: 3, breed: "Labrador", color: "black" }
              : { _id: "1", name: "Test Shelter", location: "Test Location", owner: "Test Owner", phone: "1234567890", email: "test@test.com" }
          ])
        }),
        insertOne: (doc) => Promise.resolve({ acknowledged: true }),
        replaceOne: (filter, doc) => Promise.resolve({ modifiedCount: 1 }),
        deleteOne: (filter) => Promise.resolve({ deletedCount: 1 })
      })
    })
  }),
  initDb: (callback) => callback()
}));

jest.mock('mongodb', () => ({
  ObjectId: jest.fn(id => id)
}));

jest.mock('../middleware/authenticate', () => ({
  isAuthenticated: (req, res, next) => next()
}));

const app = require('../server');

describe('Shelters API', () => {
  test('GET /shelters returns a list of shelters', async () => {
    const res = await request(app).get('/shelters');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Test Shelter');
  });

  test('GET /shelters/:id returns a single shelter', async () => {
    const res = await request(app).get('/shelters/1');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('name', 'Test Shelter');
  });

  test('POST /shelters creates a shelter', async () => {
    const newShelter = {
      name: "New Shelter",
      location: "123 Street",
      owner: "Owner Name",
      phone: "555-1234",
      email: "email@test.com"
    };
    const res = await request(app)
      .post('/shelters')
      .send(newShelter);
    expect(res.status).toBe(200);
  });

  test('PUT /shelters/:id updates a shelter', async () => {
    const updatedShelter = {
      name: "Updated Shelter",
      location: "456 Avenue",
      owner: "Updated Owner",
      phone: "555-5678",
      email: "updated@test.com"
    };
    const res = await request(app)
      .put('/shelters/1')
      .send(updatedShelter);
    expect(res.status).toBe(200);
  });

  test('DELETE /shelters/:id deletes a shelter', async () => {
    const res = await request(app).delete('/shelters/1');
    expect(res.status).toBe(200);
  });
});

describe('Dogs API', () => {
  test('GET /dogs returns a list of dogs', async () => {
    const res = await request(app).get('/dogs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Test Dog');
  });

  test('GET /dogs/:id returns a single dog', async () => {
    const res = await request(app).get('/dogs/1');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('name', 'Test Dog');
  });

  test('POST /dogs creates a dog', async () => {
    const newDog = {
      name: "New Dog",
      gender: "female",
      age: 2,
      breed: "Beagle",
      color: "brown"
    };
    const res = await request(app)
      .post('/dogs')
      .send(newDog);
    expect(res.status).toBe(200);
  });

  test('PUT /dogs/:id updates a dog', async () => {
    const updatedDog = {
      name: "Updated Dog",
      gender: "female",
      age: 4,
      breed: "Beagle",
      color: "white"
    };
    const res = await request(app)
      .put('/dogs/1')
      .send(updatedDog);
    expect(res.status).toBe(200);
  });

  test('DELETE /dogs/:id deletes a dog', async () => {
    const res = await request(app).delete('/dogs/1');
    expect(res.status).toBe(200);
  });
});