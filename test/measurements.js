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

})
