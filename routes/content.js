const express = require('express');
const router = express.Router();

const Category = require('../models/category');
const contentController = require('../controllers/content');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator')

/*CATEGORY-RELATED ROUTES */

//Fetch all categories
router.get('/categories', isAuth, contentController.getCategories);

//Create a new category
router.post('/category',
[
    body('title')
      .trim()
      .isLength({ min: 1 })
      .custom((value, { req }) => {
        return Category.findOne({ title: value }).then(categoryDoc => {
          if (categoryDoc) {
            return Promise.reject('Category already exists!');
          }
        });
      }),
    body('description')
      .trim()
      .isLength({ min: 1 })
  ], isAuth,
contentController.createCategory);

//Fetch a certain category
router.get('/category/:categoryId', isAuth, contentController.getCategory);

//Edit a certain category
router.put('/category/:categoryId',
[
    body('title')
      .trim()
      .isLength({ min: 1 }),
    body('description')
      .trim()
      .isLength({ min: 1 })
  ], isAuth,
contentController.editCategory);

//Delete a category
router.delete('/category/:categoryId', isAuth, contentController.deleteCategory);

/*NOTE-RELATED ROUTES */

//Fetch all notes
router.get('/notes', isAuth, contentController.getNotes);

//Create a new note
router.post('/note',
[
    body('title')
      .trim()
      .isLength({ min: 1 }),
    body('text')
      .trim()
      .isLength({ min: 1 })
  ], isAuth,
contentController.createNote);

//Fetch a specific note
router.get('/note/:noteId', isAuth, contentController.getNote);

//Edit a note
router.put('/note/:noteId',
[
    body('title')
      .trim()
      .isLength({ min: 1 }),
    body('text')
      .trim()
      .isLength({ min: 1 })
  ], isAuth,
contentController.editNote);

//Delete a note
router.delete('/note/:noteId', isAuth, contentController.deleteNote);


module.exports = router;