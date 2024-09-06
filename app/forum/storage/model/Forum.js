'use strict';

const mongoose = require('mongoose');

const forumSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: [
        {
            type: String
        }
    ],
    published: {
        type: Boolean,
        default: false
    },
    comments: [
        {
            content: {
                type: String
            },
            image: [
                {
                    type: String
                }
            ],
            published: {
                type: Boolean,
                default: false
            },
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
                required: true
            },
            dateEntered: {
                type: Date
            }
        }
    ]
}, { timestamps: true });

const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;
