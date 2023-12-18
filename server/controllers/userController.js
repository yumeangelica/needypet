const User = require('../models/userModel')

const getAllUsers = async (request, response) => { // only for dev, later will be removed

  try {
    const users = await User.find({}).populate('pets', 'name');
    response.json(users)
  }
  catch (error) {
    console.log('error getting users');
    console.log(error);
  }
}

const createNewUser = async (request, response, next) => {
  const { userName, password } = request.body;

  const newUserObject = {
    userName
  }

  const newUser = new User(newUserObject); // creating new user without password

  try {
    newUser.setPassword(password); // setting password with method from userModel
    await newUser.save();
    response.status(201).json(newUser);
  } catch (error) {
    next(error)
  }

}

const loginUser = async (request, response, next) => {
  const { userName, password } = request.body;

  try {
    const user = await User.findOne({ userName }); // find user by username

    if (!user || !(await user.isValidPassword(password))) { // if user not found or password is wrong
      return response.status(401).json({ error: 'Invalid username or password' });
    }

    const token = user.generateJWT(); // generate token with method from userModel
    response.status(200).json({ token, userName: user.userName, id: user._id });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllUsers,
  createNewUser,
  loginUser
}