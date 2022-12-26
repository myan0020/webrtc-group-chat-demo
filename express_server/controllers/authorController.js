const mongoose = require('mongoose');
const Author = require('../models/author');

// GET author information by author id
exports.authorDetail = (req, res, next) => {
  const mongooseId = mongoose.Types.ObjectId(req.params.id);
  Author
    .findById(mongooseId)
    .exec()
    .then(
      (author) => {
        res.json({
          id: author._id,
          firstName: author.first_name,
          familyName: author.family_name,
          dateOfBirth: author.date_of_birth,
        });
      },
      (error) => {
        next(error, null);
      }
    );

};

// GET author information list, sorted by `family_name` in ascending order
exports.authorList = (req, res, next) => {
  Author
    .find()
    .sort({ family_name: 1 })
    .exec()
    .then(
      (author_list) => {
        res.json({
          author_list: author_list.map(author => {
            const info = {
              id: author._id,
              firstName: author.first_name,
              familyName: author.family_name,
              dateOfBirth: author.date_of_birth,
            }
            return info
          })
        });
      },
      (error) => {
        return next(error);
      }
    );
};

