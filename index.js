const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp');

const bankAccountSchema   = new mongoose.Schema({
    iban : String,
    bic  : String
});
const contactPersonSchema = new mongoose.Schema({
    firstName   : String,
    lastName    : String,
    bankAccount : bankAccountSchema
});
const companySchema       = new mongoose.Schema({
    _id              : String,
    name             : String,
    contactPerson    : contactPersonSchema,
    _documentVersion : Number
}, {
    timestamps : true
});

/**
 * This is the issue: If companySchema is used instead of companySchema.clone(), updateMany works fine.
 */
const CompanyModel = mongoose.model('Company', companySchema.clone());

(async function () {
    await CompanyModel.create({
        _id              : 'abcde',
        name             : 'ACME',
        _documentVersion : 1,
    });
    await CompanyModel.updateMany({
            "_documentVersion" : 1,
            "$and"             : [
                {
                    "_id" : "abcde"
                }
            ]
        }, {
            name          : 'Other Company name',
            contactPerson : {
                firstName   : 'John',
                lastName    : 'Doe',
                bankAccount : {
                    iban : 'abc',
                    bic  : 'def'
                }
            }
        }, {
            "multi"         : false,
            "runValidators" : true,
            "context"       : "query"
        })
        .lean(true)
        .exec();
})();
