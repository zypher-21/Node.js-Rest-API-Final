const mongoose = require('mongoose');

const connectDB = async () => {
   try {
    await mongoose.connect(
        "mongodb+srv://ZD2001:forthaysbaseball@cluster0.9g603to.mongodb.net/?retryWrites=true&w=majority",
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        }
    );
   } catch (error) {
    console.log(error);
   }
}

module.exports = connectDB;