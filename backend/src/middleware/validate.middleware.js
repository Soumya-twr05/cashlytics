const { fail } = require("../utils/response");

function validate(schema, property = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) {
      return fail(
        res,
        "Validation failed",
        422,
        error.details.map((d) => d.message)
      );
    }
    req[property] = value;
    return next();
  };
}

module.exports = validate;
