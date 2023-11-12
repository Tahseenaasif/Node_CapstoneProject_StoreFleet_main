import jwt from "jsonwebtoken";

const jwtAuth = (token, res) => {
  try {
    const payload = jwt.verify(token, 'AIb6d35fvJM4O9pXqXQNla2jBCH9kuLz');
    // req.email=payload.email;
    console.log("this is email", payload.email);
    return {"success":true,
              "email":payload.email
            }

  } catch (err) {
    console.log(err);
    res.status(401).send('Please enter a valid token for password reset');
    return {"success":false,
            "email":payload.email
           }
  }
};

export default jwtAuth;
