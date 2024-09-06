'use strict';

const RS = require('../response/responseService');
const BaseValidator = require('./validation/BaseValidator');

class BaseStorage {
    constructor ({ Model, CustomValidator }) {
        this.Model = Model;
        this.validator = CustomValidator ? new CustomValidator({ Model }) : new BaseValidator({ Model });
    }

    saveAndPopulate (doc, populate) {
        if (!populate) return doc.save();
        return doc.save()
            .then(doc => {
                return this.Model.findById(doc._id).populate(populate);
            });
    }

    storeByAdmin (data, populate) {
        const doc = new this.Model(data);
        if (!populate) return doc.save();
        return this.saveAndPopulate(doc, populate);
    }

    store (data, user, populate) {
        return this.validator.store(data, user)
            .then(() => {
                const storeData = this.Model.modelName === 'User' ? data : { ...data, user: user._id };
                const doc = new this.Model(storeData);
                if (!populate) return doc.save();
                return this.saveAndPopulate(doc, populate);
            });
    }

    update (docId, updateData, user, populate) {
        return this.validator.update(docId, updateData, user)
            .then(doc => {
                updateData = { ...updateData, updatedAt: Date.now() };
                doc.set(updateData);
                return this.saveAndPopulate(doc, populate);
            });
    }

    updateOne (queryParams, updateData, user, populate) {
        updateData = { ...updateData, updatedAt: Date.now() };
        return this.Model.findOneAndUpdate(queryParams, updateData, { new: true })
            .then((doc) => {
                return this.saveAndPopulate(doc, populate);
            });
    }

    find (docId, queryParams, populate) {
        return this.validator.find(docId, queryParams)
            .then(() => {
                return populate ? this.Model.findById(docId).populate(populate) : this.Model.findById(docId);
            })
            .then(doc => {
                if (!doc) return Promise.reject(RS.errorMessage(this.Model.modelName + ' not found'));
                return Promise.resolve(doc);
            });
    }

    findOne (queryParams, populate) {
        console.log('queryParams', queryParams);
        return this.validator.findOne(queryParams)
            .then(() => {
                if (populate) {
                    return this.Model.findOne(queryParams).populate(populate);
                }
                return this.Model.findOne(queryParams);
            });
    }

    list (queryParams, populate, sortQuery, limit) {
        return this.validator.list(queryParams)
            .then(() => {
                if (populate) {
                    if (sortQuery) {
                        if (limit) {
                            return this.Model.find(queryParams).populate(populate).sort(sortQuery).limit(limit)
                                .collation({ locale: 'en_US', strength: 2 });
                        }
                        return this.Model.find(queryParams).populate(populate).sort(sortQuery)
                            .collation({ locale: 'en_US', strength: 2 });
                    }
                    return this.Model.find(queryParams).populate(populate).collation({ locale: 'en_US', strength: 2 });
                }
                if (populate) {
                    if (sortQuery) {
                        return this.Model.find(queryParams).populate(populate).sort(sortQuery)
                            .collation({ locale: 'en_US', strength: 2 });
                    }
                    return this.Model.find(queryParams).populate(populate).collation({ locale: 'en_US', strength: 2 });
                }
                if (sortQuery) return this.Model.find(queryParams).sort(sortQuery).collation({ locale: 'en_US', strength: 2 });
                return this.Model.find(queryParams).collation({ locale: 'en_US', strength: 2 });
            });
    }

    delete (docId, user) {
        return this.validator.delete(docId, user)
            .then(() => this.Model.findByIdAndRemove(docId));
    }

    deleteOne (query) {
        return this.Model.deleteOne(query);
    }

    deleteMany (queryParams) {
        return this.Model.deleteMany(queryParams);
    }
}

module.exports = BaseStorage;
