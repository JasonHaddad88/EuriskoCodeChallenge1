const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },

        text: {
            type: String,
            required: true
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            //required: true
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        tags: {
            type: Array
        }
    },
    {timestamps: true}
)

module.exports = mongoose.model('Note', noteSchema)