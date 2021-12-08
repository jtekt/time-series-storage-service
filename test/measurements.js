const request = require("supertest")
const {expect} = require("chai")
const {app} = require("../index.js")


describe("/measurements", () => {

  beforeEach( async () => {
    // Silencing console
    console.log = () => {}
  })


  describe("GET /", () => {
    it("Should return root", async () => {
      const {status} = await request(app)
        .get("/")

      expect(status).to.equal(200)
    })
  })

  describe("GET /", () => {
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

})
