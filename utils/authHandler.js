let userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
module.exports = {
  CheckLogin: async function (req, res, next) {
    try {
      let token;

      if (req.cookies.TOKEN_NNPTUD_C3) {
        token = req.cookies.TOKEN_NNPTUD_C3;
      } else {
        token = req.headers.authorization;

        if (!token || !token.startsWith("Bearer")) {
          return res.status(403).send({ message: "ban chua dang nhap" });
        }

        token = token.split(' ')[1];
      }

      const jwtSecret = process.env.JWT_SECRET || 'secret';
      let result = jwt.verify(token, jwtSecret);

      let getUser = await userController.GetUserById(result.id);

      if (!getUser) {
        return res.status(403).send({ message: "ban chua dang nhap" });
      }

      req.user = getUser;

      next();

    } catch (error) {
      res.status(403).send({ message: "ban chua dang nhap" });
    }
  }
};