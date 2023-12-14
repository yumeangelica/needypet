require('dotenv').config()

const User = require('../models/userModel')

const getAllUsers = async (request, response) => { // only for dev, later will be removed

  try{
    const users = await User.find({})
    response.json(users)
  }
  catch(error){
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


module.exports = {
  getAllUsers,
  createNewUser
}