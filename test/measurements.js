const request = require("supertest")
const {expect} = require("chai")
const {app} = require("../index.js")


describe("/measurements", () => {

  before( async () => {
    // Silencing console
    console.log = () => {}
  })

  let point_time


  describe("GET /", () => {
    it("Should return root", async () => {
      const {status} = await request(app)
        .get("/")

      expect(status).to.equal(200)
    })
  })

  describe("GET /measurements", () => {
    it("Should allow measurement query", async () => {
      const {status} = await request(app)
        .get("/measurements")

      expect(status).to.equal(200)
    })
  })

  describe("POST /measurements/:measurement", () => {
    it("Should allow posting a point", async () => {
      const {status} = await request(app)
        .post("/measurements/tdd")
        .send({temperature: 22.1})

      expect(status).to.equal(200)
    })
  })

  describe("GET /measurements/:measurement", () => {
    it("Should allow measurement query", async () => {
      const {status, body} = await request(app)
        .get("/measurements/tdd")
      
      point_time = body[0]._time


      expect(status).to.equal(200)
      expect(body).to.have.lengthOf.above(0)

    })
  })

  describe("DELETE /measurements/:measurement", () => {
    it("Should allow deleting a whole measurement", async () => {
      const {status} = await request(app)
        .delete("/measurements/tdd")

      expect(status).to.equal(200)
    })
  })

})
