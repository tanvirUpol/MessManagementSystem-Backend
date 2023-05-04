import  jwt  from "jsonwebtoken";

// const requireAuth = async 
// const SECRET_KEY = 'your-secret-key';

const requireAuth = (context) => {

  const authHeader = context;

  if (authHeader) {
    // Extract the token from the authorization header
    const token = authHeader.split(' ')[1]

    if (token) {
      try {
        // Verify the token using the secret key
        const user = jwt.verify(token, process.env.SECRET);
        return user;
      } catch (error) {
        throw new AuthenticationError('Invalid/Expired token');
      }
    }

    throw new Error("Authentication token must be 'Bearer [token]'");
  }

  throw new Error('Authorization header must be provided');
};

export default requireAuth;