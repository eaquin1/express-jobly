const sqlForPartialUpdate = require("../../helpers/partialUpdate")

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {
       const update = sqlForPartialUpdate("users", {last_name: "joe"}, "username", "joseph")
  
    expect(update.query).toEqual(`UPDATE users SET last_name=$1 WHERE username=$2 RETURNING *`);
    expect(update.values).toEqual(["joe", "joseph"])
  });

  it("should generate a proper partial update with 2 fields", 
    function() {
      const update = sqlForPartialUpdate("users", {first_name: "sally", email:"mustang_sally@s.com"}, "username", "sal")

      expect(update.query).toEqual(`UPDATE users SET first_name=$1, email=$2 WHERE username=$3 RETURNING *`)
      expect(update.values).toEqual(["sally", "mustang_sally@s.com", "sal"])
    })
});
