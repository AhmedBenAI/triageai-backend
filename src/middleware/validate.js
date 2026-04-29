import { body, validationResult } from "express-validator";

export const validateTicketRequest = [
  body("ticket")
    .isString()
    .withMessage("ticket must be a string")
    .trim()
    .notEmpty()
    .withMessage("ticket cannot be empty")
    .isLength({ min: 10, max: 5000 })
    .withMessage("ticket must be between 10 and 5000 characters"),

  body("options.ragTopK")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("options.ragTopK must be an integer between 1 and 5"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  },
];
