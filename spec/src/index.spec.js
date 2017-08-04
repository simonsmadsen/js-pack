import database from './../../src/database'

describe("Babel", function() {
  it("is using babel and can import and export", function() {
      console.log(database)
      expect('types!').toBe('types!');
  });
});
