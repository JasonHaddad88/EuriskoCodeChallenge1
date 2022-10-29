
const { validationResult } = require('express-validator');
const Category = require('../models/category');
const Note = require('../models/note');
const User = require('../models/user');

/* PART A - CATEGORY CONTROLLERS */

//Fetch all categories
exports.getCategories = (req, res, next) => {
    Category.find()
      .then(categories => {
        res.status(200).json({
          message: 'Fetched categories successfully.',
          categories: categories,
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
    });
};

//Create a category
exports.createCategory = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res
        .status(422)
        .json({
            message: 'Validation failed. Incorrect entered data',
            errors: errors.array()
        })}
    const title = req.body.title;
    const description = req.body.description;
    const category = new Category({
        title: title, 
        description: description, 
        createdAt: new Date()})
    
    category
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Category created successfully!',
            category: result
                
            })
        })
       
    }

//Fetch a specific category and its notes
exports.getCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    Category.findById(categoryId)
    .then(category => {
        if(!category) {
            const error = new Error('Category was not found. ');
            error.statusCode = 404;
            throw error;
        }
        })
        Note.find({categoryId: categoryId})
        .then(notes => {
        if(!notes){
            const error = new Error('Category has no notes.');
            error.statusCode = 404;
            throw error;
        }
        console.log("We found notes!")
        res.status(200).json({message: 'Fetched notes.', notes: notes, category: categoryId});
        }
        )

    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

//Edit a specific category
exports.editCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed. Entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const description = req.body.description;
    Category.findById(categoryId)
    .then(category => {
        if(!category) {
            const error = new Error('Could not find category. ');
            error.statusCode = 404;
            throw error;
        }
        category.title = title;
        category.description = description;
        Note.find({categoryId: categoryId})
        .then(notes=> {
            Note.updateMany({categoryTitle: category.title})
        })
        return category.save();
    })
    .then(result => {
        res.status(200).json({
            message: 'Updated category and notes',
            category: result
            
        })
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err);
    })
}

//Delete a specific category and its notes
exports.deleteCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    Category.findById(categoryId)
    .then(category => {
        if(!category){
            const error = new Error('Could not find category.');
            error.statusCode = 404;
            throw error;
        }
        return Category.findByIdAndRemove(categoryId);
        })
        Note.deleteMany({categoryId: categoryId})
        .then(
            res.status(201).json({message: "Category and notes deleted"})
        )
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
}

/* PART B - NOTE CONTROLLERS */

//Fetch all notes + optional criteria (sort by updateDate, fetch by tags, pagination)
exports.getNotes = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 5;
    const sort = req.query.sort;
    const order = req.query.order;
    const tags = req.query.tags
    Note.find()
      .countDocuments()
      .then(count => {
        return Note.find()
          .skip((currentPage - 1) * perPage)
          .limit(perPage);

      }
      )
      .then(notes => {
        if (sort == 'updateDate' && order == 'new'){
            const pipeline = [
                {
                    $sort :{
                        updatedAt: -1
                    }
                }
            ]
            Note.aggregate(pipeline)
            .then(result => { 
            return res.status(200).json({
                message: 'Fetched notes successfully.',
                notes: result,
              });
            }
            )

        }
        if (sort == 'updateDate' && order == 'old'){
            
            const pipeline = [
                {
                    $sort :{
                        updatedAt: 1
                    }
                }
            ]
            Note.aggregate(pipeline)
            .then(result => { 
                return res.status(200).json({
                    message: 'Fetched notes successfully.',
                    notes: result,
                  });
                }
                )
            }
        if(tags != null){
            const myTags = tags.split('_');
            const pipeline = [
                {
                $match :{
                    tags: { $all: [...myTags] }

                }
            }
            ]
            Note.aggregate(pipeline)
            .then(notes => {
                if(!notes){
                    const error = new Error('No note with these tags could be found.');
                    error.statusCode = 401;
                    throw error;
                }
            return res.status(200).json({
                message: 'Fetched notes successfully.',
                notes: notes,
            })
            })

        }
        if(sort == null && order == null && tags == null){
            return res.status(200).json({
                message: 'Fetched notes successfully.',
                notes: notes,
        }
      )
    }
}
      )
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
    });
};

//Create new note
exports.createNote = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res
        .status(422)
        .json({
            message: 'Validation failed. Incorrect entered data',
            errors: errors.array()
        })}
    const title = req.body.title;
    const text = req.body.text;
    const categoryTitle = req.body.categoryTitle;
    const tags = req.body.tags;
    let creator;
    Category.findOne({title: categoryTitle})
    .then(category => {
        if (!category) {
            const error = new Error('This category could not be found.');
            error.statusCode = 401;
            throw error;
        }
        const note = new Note({
            title: title, 
            text: text,
            categoryId: category._id,
            creator: req.userId,
            tags: tags
        })
        note
        .save()
        .then(result => {
        res.status(201).json({
                message: 'Note created successfully!',
                note: note
        })
        })
        .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            });
        })}

//Fetch a specific note
exports.getNote = (req, res, next) => {
    const noteId = req.params.noteId;
    Note.findById(noteId)
    .then(note => {
        if(!note) {
            const error = new Error('Note was not found. ');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message: 'Fetched note.', note: note});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

//Edit a specific note
exports.editNote = (req, res, next) => {
    const noteId = req.params.noteId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed. Entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const text = req.body.text;
    const tags = req.body.tags
    Note.findById(noteId)
    .then(note => {
        if(!note) {
            const error = new Error('Could not find note. ');
            error.statusCode = 404;
            throw error;
        }
        note.title = title;
        note.text = text;
        note.tags = tags;
        return note.save();
    })
    .then(result => {
        res.status(200).json({
            message: 'Updated note',
            note: result
            
        })
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err);
    })
}

//Delete a specific note
exports.deleteNote = (req, res, next) => {
    const noteId = req.params.noteId;
    Note.findById(noteId)
    .then(note => {
        if(!note){
            const error = new Error('Could not find note.');
            error.statusCode = 404;
            throw error;
        }
        return Note.findByIdAndRemove(noteId);
        })
        .then(result => {
            return User.findById(req.userId);
          })
          .then(user => {
            user.notes.pull(noteId);
            return user.save();
          })
          .then(result => {
            res.status(200).json({ message: 'Deleted note.' });
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      };






