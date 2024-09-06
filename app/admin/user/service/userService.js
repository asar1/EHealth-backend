'use strict';

const _ = require('lodash');
const bcryptjs = require('bcryptjs');
// const csv = require('csv-parser');
// const csv = require('csv');
const fs = require('fs');
// const ExcelJS = require('exceljs');
const readXlsxFile = require('read-excel-file/node');
const moment = require('moment');
const xl = require('excel4node');
// const moment = require('moment');
const RS = require('../../../base/response/responseService');
const User = require('../../../auth/storage/model/User');
const UserStorage = require('../../../auth/storage/UserStorage');
const UserValidator = require('../../../auth/storage/validation/UserValidator');
const userStorage = new UserStorage({
    Model: User,
    CustomValidator: UserValidator
});
const userPopulation = require('../../../auth/storage/populate/userPopulation');
const cron = require('node-cron');
const unavailabilityService = require('../../../unavailability/service/unavailabilityService');

// const inputFile = require('../../docs/dataFromGoogleForm.csv')
// const addScientist = (param) => {
//     const salt = 10;
//     return userStorage.store({
//         name: param.name,
//         email: param.email,
//         password: bcryptjs.hashSync(param.password, salt),
//         role: 'scientist'
//     }, null, userPopulation.find);
// };

const updateUser = async (userId, param, user) => {
    try {
        if (param.oldPassword && param.newPassword) {
            const changeUserPassword = await changePassword(
                userId,
                param.oldPassword,
                param.newPassword
            );
            return changeUserPassword;
        }
        const updateData = { ...param };
        return userStorage.update(userId, updateData, user, userPopulation.find);
    } catch (err) {
        return Promise.reject(RS.errorMessage(err.message));
    }
};

const createHospital = async (param, user) => {
    const salt = 10;
    const dataToSend = {
        name: param.name,
        // lastName: param.lastName,
        email: param.email,
        phoneNo: param.phoneNo,
        userName: param.userName,
        role: 'hospital',
        password: bcryptjs.hashSync(param.password, salt)
    };

    return userStorage.storeByAdmin(dataToSend, userPopulation.find);
};

const getAUser = async (userId) => {
    try {
        const user = await userStorage.findOne({ _id: userId });
        return Promise.resolve(user);
    } catch (err) {
        return Promise.reject(RS.errorMessage(err.message));
    }
};

const changeUserRole = (userId, role, user) => {
    if (role === 'user' || role === 'admin') {
        const updateData = {
            role: role
        };
        return userStorage.update(userId, updateData, user);
    }
    return Promise.reject(RS.errorMessage('Role is not applicable'));
};

const blockUser = (userId, user) => {
    const updateData = {
        suspend: true
    };
    return userStorage.update(userId, updateData, user);
};

const unblockUser = (userId, user) => {
    const updateData = {
        suspend: false
    };
    return userStorage.update(userId, updateData, user);
};

const markDoctorAsSponsored = (param, user) => {

    if (param.sponsorshipExpiresIn == new Date().toISOString().split('T')[0]) {
        return Promise.reject({
            message: 'mark doctor as sponsered at least for one day.'
        });
    } else {
        const dataToSend = {
            isSponsored: true,
            sponsorshipExpiresIn: param.sponsorshipExpiresIn
        };

        return userStorage.update(
            param.doctor,
            dataToSend,
            user,
            userPopulation.find
        );
    }
};

// const usersData = async () => {
//     const users = await userStorage.list();
//     var wb = new xl.Workbook();
//     const ws = wb.addWorksheet('sheet 1');

//     ws.cell(1, 1).string('S.no');
//     ws.cell(1, 2).string('first name');
//     ws.cell(1, 3).string('last name');
//     ws.cell(1, 4).string('email');
//     ws.cell(1, 5).string('country');
//     ws.cell(1, 6).string('gender');
//     ws.cell(1, 7).string('services');
//     ws.cell(1, 8).string('isTTC');
//     ws.cell(1, 9).string('isAgreed');
//     ws.cell(1, 10).string('news Letter');

//     for (var i = 0; i < users.length; i++) {
//         ws.cell(i + 2, 1).number(i + 1);
//         ws.cell(i + 2, 2).string(users[i].firstName);
//         ws.cell(i + 2, 3).string(users[i].lastName);
//         ws.cell(i + 2, 4).string(users[i].email);
//         ws.cell(i + 2, 5).string(users[i].country);
//         ws.cell(i + 2, 6).string(users[i].gender);
//         ws.cell(i + 2, 7).string(users[i].services);
//         if (users[i].isTTC) {
//             ws.cell(i + 2, 8).string('true');
//         } else {
//             ws.cell(i + 2, 8).string('false');
//         }
//         if (users[i].isAgreed) {
//             ws.cell(i + 2, 9).string('true');
//         } else {
//             ws.cell(i + 2, 9).string('false');
//         }
//         if (users[i].newsLetter) {
//             ws.cell(i + 2, 10).string('true');
//         } else {
//             ws.cell(i + 2, 10).string('false');
//         }

//         wb.write('documents/UserList.xlsx', (err, stats) => {
//             if (err) {
//                 return Promise.reject(RS.errorMessage(err));
//             } else {
//                 return Promise.resolve('Download Successfully');
//             }
//         }, err => console.log(err));
//     }
// };

// Download Fc user data
// const FcusersData = async () => {
//     const users = await userStorage.list({ services: 'FC' });
//     var wb = new xl.Workbook();
//     const ws = wb.addWorksheet('sheet 1');
//     var j = 0;
//     ws.cell(1, 1).string('S.no');
//     ws.cell(1, 2).string('first name');
//     ws.cell(1, 3).string('last name');
//     ws.cell(1, 4).string('email');
//     ws.cell(1, 5).string('country');
//     ws.cell(1, 6).string('year of birth');
//     ws.cell(1, 7).string('order date');
//     ws.cell(1, 8).string('type of test');
//     ws.cell(1, 9).string('questionnaire finnished');
//     for (var i = 0; i < users.length; i++) {
//         // if (users[i].services == "FC") {
//         const fertilityCheckup = await fertilityCheckupStorage.findOne({ user: users[i]._id });
//         ws.cell(j + 2, 1).number(i + 1);
//         ws.cell(j + 2, 2).string(users[i].firstName);
//         ws.cell(j + 2, 3).string(users[i].lastName);
//         ws.cell(j + 2, 4).string(users[i].email);
//         ws.cell(j + 2, 5).string(users[i].country);
//         ws.cell(i + 2, 6).date(users[i].yearOfBirth);
//         ws.cell(i + 2, 7).date(fertilityCheckup.Orderdate);
//         ws.cell(i + 2, 8).date(fertilityCheckup.testType);
//         ws.cell(i + 2, 9).date(fertilityCheckup.Questionnaire_finished);
//         wb.write('documents/FCUserList.xlsx', (err, stats) => {
//             if (err) {
//                 return Promise.reject(RS.errorMessage(err));
//             } else {
//                 return Promise.resolve('Download Successfully');
//             }
//         }, err => console.log(err));
//         j++;
//     }
//     // }
// };

const deleteUser = async (userId, user) => {
    try {
        // const deleteUser = await userStorage.delete(userId);
        const updateData = {
            suspend: true
        };
        return userStorage.update(userId, updateData, user);
        // return Promise.resolve('user removed successfully');
    } catch (err) {
        return Promise.reject(RS.errorMessage(err.message));
    }
};

const deleteUserForever = async (userId, user) => {
    try {
        await userStorage.delete(userId, user);
        return Promise.resolve('user removed successfully');
    } catch (err) {
        return Promise.reject(RS.errorMessage(err.message));
    }
};

const changePassword = (userId, oldPassword, newPassword) => {
    return User.findOne({ _id: userId })
        .populate(userPopulation.find)
        .then((user) => {
            if (user && bcryptjs.compareSync(oldPassword, user.password)) {
                const updatePassword = { password: bcryptjs.hashSync(newPassword, 10) };
                return userStorage.update(
                    userId,
                    updatePassword,
                    user,
                    userPopulation.find
                );
            } else {
                return Promise.reject(RS.errorMessage('Incorrect old password'));
            }
        });
};

// const obj = new csv();
// async function readFileCSV (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, branches, q, r, s, t, u, v, w, x, y) {
//     // let moreClinics = [];
//     // let oneBranche = {};
//     // console.log("branches",branches)
//     // let morebranches = branches.split("\n");
//     // for (var i = 1; i < morebranches.length; i++) {
//     //     let clininName = morebranches[i].split(",")[0]
//     //     let location = morebranches[i].split(",")[1]
//     //     oneBranche = {
//     //         moreClinicName: clininName,
//     //         moreClinicCity: location
//     //     }
//     //     moreClinics.push(oneBranche)
//     // }

//     const generateRandomPassword = Math.random().toString(36).substring(5);
//     const getDate = new Date(a);
//     const dateInFormat = moment(getDate).format('YYYY-MM-DD');
//     const user = {
//         firstName: b,
//         lastName: c,
//         email: d,
//         password: generateRandomPassword,
//         country: e,
//         gender: f,
//         yearOfBirth: Number(g),
//         createdAt: dateInFormat
//     };
//     console.log(user, 'this is user');
//     const Answer1 = h;
//     console.log(Answer1, 'Answer1');
//     const Answer2 = i;
//     console.log(Answer2, 'Answer2');
//     const Answer3 = j;
//     console.log(Answer3, 'Answer3');
//     const Answer4 = k;
//     console.log(Answer4, 'Answer4');
// }

// const readExcelFile = async () => {
//     const userData = [];
//     try {
//         return readXlsxFile('finalisedData1.xlsx').then(async (row) => {
//             // `rows` is an array of rows
//             // each row being an array of cells.
//             // let writeStream = fs.createWriteStream("C:/Users/HP/Documents/UserAccounts.xls");
//             // let header = " Email" + "\t" + "Password" + "\n";
//             // writeStream.write(header);
//             for (var index = 2; index < row.length; index++) {
//                 const arrayObj = row[index];
//                 const questionId = row[1];
//                 let getUser = await userStorage.findOne({ email: arrayObj[3].trim().toLowerCase() }, userPopulation.find);
//                 if (!getUser) {
//                     const salt = 10;
//                     var generateRandomPassword = Math.random().toString(36).substring(5);
//                     // let row1 = arrayObj[3].trim().toLowerCase() + "\t" + generateRandomPassword + "\n";
//                     // writeStream.write(row1);
//                     const user = {
//                         firstName: arrayObj[1].trim(),
//                         lastName: arrayObj[2].trim(),
//                         email: arrayObj[3].trim(),
//                         password: bcryptjs.hashSync(generateRandomPassword, salt),
//                         country: arrayObj[4].trim(),
//                         gender: arrayObj[5].trim(),
//                         yearOfBirth: arrayObj[6]
//                         // createdAt: dateInFormat
//                     };
//                     getUser = await userStorage.storeByAdmin(user, userPopulation.find);
//                 }
//                 var userAccounts = {
//                     _id: getUser._id,
//                     email: arrayObj[3].trim().toLowerCase(),
//                     password: generateRandomPassword || ''
//                 };
//                 userData.push(userAccounts);
//                 // let completeAnswer = await clinicReviewService.addReviewsFromScript(row[1][7], row[index][7].trim())
//                 // let completeAnswer = await clinicReviewService.addReviewsFromScript(row[1][7], row[index][7].trim(), {}, row[index][9].trim())
//                 // let completeAnswer = await clinicReviewService.addReviewsFromScript(row[1][10], row[index][10].trim())
//                 // let completeAnswer = await clinicReviewService.addReviewsFromScript(row[1][19], row[index][19].trim())
//                 let question = row[1][7];
//                 console.log('this is answer', row[index][7]);
//                 let completeAnswer = await clinicReviewService.addReviewsFromScript(row[1][7], row[index][7]);

//                 const dataForClinicReviewStorage = {
//                     clinic: null,
//                     isQuestion: false
//                 };
//                 const result = await clinicReviewStorage.store(dataForClinicReviewStorage, getUser, clinicReviewPopulation.find);
//                 let dataForClinicFeedback = {
//                     review: result._id,
//                     question: question
//                 };
//                 if (result) {
//                     if (completeAnswer.actualQuestion.type === 'checkBoxes' || completeAnswer.actualQuestion.type === 'freeText' || completeAnswer.actualQuestion.type === 'radioText') {
//                         dataForClinicFeedback.answer = completeAnswer.answer;
//                         dataForClinicFeedback.language = 'en';
//                         dataForClinicFeedback.translation = completeAnswer.translationObj;
//                     } else if (completeAnswer.actualQuestion.type === 'radioNumber') {
//                         dataForClinicFeedback.answerNumber = completeAnswer.answer;
//                     } else if (completeAnswer.actualQuestion.type === 'checkBoxesOfObjects') {
//                         dataForClinicFeedback.answer = completeAnswer.answer;
//                         dataForClinicFeedback.language = 'en';
//                         dataForClinicFeedback.translation = completeAnswer.translationObj;
//                     }
//                     // console.log(data, "this is data for review");

//                     await clinicReviewFeedbackService.addClinicReviewFeedback(dataForClinicFeedback, getUser);
//                 }
//                 question = row[1][8];
//                 completeAnswer = await clinicReviewService.addReviewsFromScript(row[1][8], row[index][8], {}, row[index][9]);
//                 dataForClinicFeedback = {
//                     review: result._id,
//                     question: question
//                 };
//                 if (completeAnswer.actualQuestion.type === 'checkBoxes' || completeAnswer.actualQuestion.type === 'freeText' || completeAnswer.actualQuestion.type === 'radioText') {
//                     dataForClinicFeedback.answer = completeAnswer.answer;
//                     dataForClinicFeedback.language = 'en';
//                     dataForClinicFeedback.translation = completeAnswer.translationObj;
//                 } else if (completeAnswer.actualQuestion.type === 'radioNumber') {
//                     dataForClinicFeedback.answerNumber = completeAnswer.answer;
//                 } else if (completeAnswer.actualQuestion.type === 'checkBoxesOfObjects') {
//                     dataForClinicFeedback.answer = completeAnswer.answer;
//                     dataForClinicFeedback.language = 'en';
//                     dataForClinicFeedback.translation = completeAnswer.translationObj;
//                 }

//                 await clinicReviewFeedbackService.addClinicReviewFeedback(dataForClinicFeedback, getUser);

//                 question = row[1][10];
//                 completeAnswer = await clinicReviewService.addReviewsFromScript(row[1][10], row[index][10]);
//                 dataForClinicFeedback = {
//                     review: result._id,
//                     question: question
//                 };
//                 if (completeAnswer.actualQuestion.type === 'checkBoxes' || completeAnswer.actualQuestion.type === 'freeText' || completeAnswer.actualQuestion.type === 'radioText') {
//                     dataForClinicFeedback.answer = completeAnswer.answer;
//                     dataForClinicFeedback.language = 'en';
//                     dataForClinicFeedback.translation = completeAnswer.translationObj;
//                 } else if (completeAnswer.actualQuestion.type === 'radioNumber') {
//                     dataForClinicFeedback.answerNumber = completeAnswer.answer;
//                 } else if (completeAnswer.actualQuestion.type === 'checkBoxesOfObjects') {
//                     dataForClinicFeedback.answer = completeAnswer.answer;
//                     dataForClinicFeedback.language = 'en';
//                     dataForClinicFeedback.translation = completeAnswer.translationObj;
//                 }

//                 await clinicReviewFeedbackService.addClinicReviewFeedback(dataForClinicFeedback, getUser);

//                 question = row[1][11];
//                 completeAnswer = await clinicReviewService.addReviewsFromScript(row[1][11], row[index][11]);
//                 dataForClinicFeedback = {
//                     review: result._id,
//                     question: question
//                 };
//                 if (completeAnswer.actualQuestion.type === 'checkBoxes' || completeAnswer.actualQuestion.type === 'freeText' || completeAnswer.actualQuestion.type === 'radioText') {
//                     dataForClinicFeedback.answer = completeAnswer.answer;
//                     dataForClinicFeedback.language = 'en';
//                     dataForClinicFeedback.translation = completeAnswer.translationObj;
//                 } else if (completeAnswer.actualQuestion.type === 'radioNumber') {
//                     dataForClinicFeedback.answerNumber = completeAnswer.answer;
//                 } else if (completeAnswer.actualQuestion.type === 'checkBoxesOfObjects') {
//                     dataForClinicFeedback.answer = completeAnswer.answer;
//                     dataForClinicFeedback.language = 'en';
//                     dataForClinicFeedback.translation = completeAnswer.translationObj;
//                 }

//                 await clinicReviewFeedbackService.addClinicReviewFeedback(dataForClinicFeedback, getUser);

//                 const clinicName = arrayObj[12].trim();
//                 // let clinicCity = arrayObj[13].trim()
//                 // let clinicCountry = arrayObj[14].trim()
//                 // let city = '/^'+clinicCity+'$/i'
//                 // let country = '/^'+clinicCountry+'$/i'
//                 // let name = '/^'+clinicName+'$/i'

//                 const createdClinic = await clinicStorage.findOne({ name: { $regex: '^' + clinicName + '$', $options: 'i' } }, clinicPopulation.find);
//                 // let createdClinic
//                 console.log(createdClinic, 'createdClinic');
//                 if (createdClinic) {

//                 } else {
//                     console.log('.....................................' + clinicName);
//                     continue;
//                 }
//                 // if (searchResultClinics &&
//                 //      (searchResultClinics.city.toLowerCase() === clinicCity.toLowerCase() || searchResultClinics.citysv.toLowerCase() === clinicCity.toLowerCase()) &&
//                 //      (searchResultClinics.country.toLowerCase() === clinicCountry.toLowerCase() || searchResultClinics.countrysv.toLowerCase() === clinicCity.toLowerCase())) {
//                 //     createdClinic = searchResultClinics
//                 // }
//                 // else {
//                 //     let data = {
//                 //         name: clinicName,
//                 //         city: clinicCity,
//                 //         country: clinicCountry
//                 //     }
//                 //     createdClinic = await clinicStorage.store(data, clinicPopulation.find)
//                 // }
//                 await clinicReviewService.updateClinicReview(result._id, { clinic: createdClinic._id }, getUser, clinicReviewPopulation.find);

//                 const reviewWholeData = [];

//                 for (var j = 15; j <= 41; j++) {
//                     question = row[1][j];
//                     const answertoCheck = row[index][j];
//                     if (answertoCheck !== null) {
//                         if (question === '5df290fe58161c33a4ed1dd4') {
//                             console.log('in the check', question);
//                             console.log('jjjj', j, 'index', index);
//                             completeAnswer = await clinicReviewService.addReviewsFromScript(row[1][j], row[index][j], {}, row[index][j + 1]);
//                         } else {
//                             completeAnswer = await clinicReviewService.addReviewsFromScript(row[1][j], row[index][j]);
//                         }
//                         dataForClinicFeedback = {
//                             review: result._id,
//                             question: question,
//                             user: getUser._id
//                         };
//                         if (completeAnswer.actualQuestion.type === 'checkBoxes' || completeAnswer.actualQuestion.type === 'freeText' || completeAnswer.actualQuestion.type === 'radioText') {
//                             dataForClinicFeedback.answer = completeAnswer.answer;
//                             dataForClinicFeedback.language = 'en';
//                             dataForClinicFeedback.translation = completeAnswer.translationObj;
//                         } else if (completeAnswer.actualQuestion.type === 'radioNumber') {
//                             dataForClinicFeedback.answerNumber = completeAnswer.answer;
//                         } else if (completeAnswer.actualQuestion.type === 'checkBoxesOfObjects') {
//                             dataForClinicFeedback.answer = completeAnswer.answer;
//                             dataForClinicFeedback.language = 'en';
//                             dataForClinicFeedback.translation = completeAnswer.translationObj;
//                         }
//                         reviewWholeData.push(dataForClinicFeedback);
//                         if (question === '5df290fe58161c33a4ed1dd4') {
//                             j++;
//                         }
//                     }
//                 }
//                 await ClinicReviewFeedback.insertMany(reviewWholeData);
//                 const publishReview = { status: 'published', isCompleted: true, isQuestion: false };
//                 // console.log("index", j, index)
//                 // console.log("arrayObj[42]", arrayObj[42])
//                 if (arrayObj[42] !== null) {
//                     const clinicName = arrayObj[42].trim().split(',')[0].toLowerCase();
//                     // console.log("clinicName", clinicName)
//                     if (clinicName === 'yes') {
//                         publishReview.isQuestion = true;
//                     }
//                 }
//                 // console.log(publishReview, "publishReview")
//                 await clinicReviewService.updateClinicReview(result._id, publishReview, getUser, clinicReviewPopulation.find);
//             }
//         });
//     } catch (err) {
//         return Promise.reject(RS.errorMessage(err.message));
//     }
// };

// const readfile = () => {
//     const MyData = [];
//     obj.from.path('D:/Projects/Tilly/tilly-backend/app/admin/docs/UserReview.csv').to.array((data) => {
//         //     // console.log("data csv", data[1][8])
//         for (var index = 0; index < data.length; index++) {
//             //         // for (var i = 0; i < 30; i++) {
//             //         // console.log(data[index][8],"in loop i")
//             //         // MyData.push( MyCSV(
//             //         //     data[index][0], data[index][1], data[index][2], data[index][3], data[index][4], data[index][5],
//             //         //     data[index][6], data[index][7], data[index][8], data[index][9], data[index][10], data[index][11], data[index][12]
//             //         //     , data[index][13], data[index][14], data[index][15], data[index][16], data[index][17], data[index][18], data[index][19]
//             //         //     , data[index][20], data[index][21], data[index][22], data[index][23], data[index][24], data[index][25], data[index][26]
//             //         //     , data[index][27], data[index][28], data[index][29], data[index][30], data[index][31], data[index][32], data[index][33]
//             //         // ));
//             MyData.push(readFileCSV(
//                 data[index][0], data[index][1], data[index][2], data[index][3], data[index][4], data[index][5],
//                 data[index][6], data[index][7], data[index][8], data[index][9], data[index][10], data[index][11]
//                 // data[index][12], data[index][13], data[index][14], data[index][15],
//                 // data[index][16], data[index][17], data[index][18], data[index][19], data[index][20],
//                 // data[index][21], data[index][22], data[index][23],
//                 // data[index][24]
//             ));
//             // console.log("mydata", MyData)
//             // }
//         }

//         // console.log(MyData);
//         // return MyData
//         // });
//         // var salt = 10
//         // var MyData = [];
//         // fs.createReadStream('D:/Projects/Tilly/tilly-backend/app/admin/docs/UserReview.csv')
//         //     .pipe(csv())
//         //     .on('data', (row) => {
//         //         let generateRandomPassword = Math.random().toString(36).substring(5);
//         //         let data = {
//         //             email: row.Email,
//         //             password: generateRandomPassword
//         //         }
//         //         console.log(data)
//         //         let getDate = new Date(row.Timestamp);
//         //         let dateInFormat = moment(getDate).format('YYYY-MM-DD');
//         //         let user = {
//         //             firstName: row.First_name.trim(),
//         //             lastName: row.Last_name.trim(),
//         //             email: row.Email.trim(),
//         //             password: bcryptjs.hashSync(generateRandomPassword, salt),
//         //             country: row.Your_country_of_residence.trim(),
//         //             gender: row.Your_gender.trim(),
//         //             yearOfBirth: Number(row.Your_year_of_birth.trim()),
//         //             createdAt: dateInFormat
//         //         }
//         //         // console.log(user, "this is user")
//         //         MyData.push(user)

//         //     })
//         //     .on('end', () => {
//         //         // console.log(MyData,'CSV file successfully processed');
//         //         User.insertMany(MyData)
//         //         return
//         //     });
//     });
// };

// const readfileOne = async () => {
//     //     var columns = ['Official clinic name', 'Website', 'Phone', 'Street', 'Postal code', 'Town EN',
//     //         'Town SE', 'Country EN', 'Country SE', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'more clinics', 'IVF',
//     //         'Miscarriage Specialist', 'Egg Freezing', 'Donor Eggs', 'Donor Sperms', 'PGS/PGT-A', 'PGD/PGT-M/PGT-SR',
//     //         'Annual number of cycles*', 'Annual number National Average*', 'Age <= 30', 'Nat. avg. age < 30',
//     //         'Age 31-35', 'Nat. average 31-35', 'Age 36-37', 'Nat. average 36-37', 'Age 38-39', 'Nat. average 38-39'
//     //     ];
//     //     require('csv-to-array')({
//     //         file: inputFile,
//     //         columns: columns
//     //     }, async (err, array) => {
//     //         var data = [];
//     //         let correctOption = {};
//     //         console.log("array length", array.length)
//     //         console.log("array", array)
//     //         if (!err) {
//     //             for (var i = 1; i < array.length; i++) {

//     //                 const categoryName = array[i].Category.trim();
//     //                 if (array[i].CorrectAnswer.trim() === 'Option 1') {
//     //                     correctOption = array[i].Option1.trim();
//     //                 } else if (array[i].CorrectAnswer.trim() === 'Option 2') {
//     //                     correctOption = array[i].Option2.trim();
//     //                 } else if (array[i].CorrectAnswer.trim() === 'Option 3') {
//     //                     correctOption = array[i].Option3.trim();
//     //                 } else if (array[i].CorrectAnswer.trim() === 'Option 4') {
//     //                     correctOption = array[i].Option4.trim();
//     //                 }
//     //                 const questionData = {
//     //                     category: getCategory ? getCategory._id : saveCatregory._id,
//     //                     question: array[i].Question.trim(),
//     //                     option1: array[i].Option1.trim(),
//     //                     option2: array[i].Option2.trim(),
//     //                     option3: array[i].Option3.trim(),
//     //                     option4: array[i].Option4.trim(),
//     //                     correctAnswer: correctOption,
//     //                     referenceLink: array[i].Link
//     //                 };
//     //                 data.push(questionData);
//     //             }
//     //         }
//     //     });
// };

// const removeEsterik = async () => {
//     const withEsteric = await clinicReviewFeedbackStorage.list({ question: '5df291e358161c33a4ed1dd7' }, clinicReviewFeedbackPopulation.list);

//     const withComma = [];

//     for (var i = 0; i <= withEsteric.length; i++) {
//         var previous = withEsteric[i];

//         if (previous) {
//             previous.answer = previous.answer.split('*').join(',');
//             const answerToreplace = previous.translation[0].answer;
//             previous.translation[0].answer = answerToreplace.split('*').join(',');

//             withComma.push(previous);

//             await ClinicReviewFeedback.update({ _id: previous._id }, previous);
//         }
//     }
//     // await ClinicReviewFeedback.updateMany({"question":"5df291e358161c33a4ed1dd7"},withComma);
//     return withComma;
// };

// cron job to un mark doctors sponsorship at sponsorship expiry date.
cron.schedule('00 00 03 * * *', async () => {
    console.log('Running Cron Job');
    let today = new Date();
    today = moment(today).format('YYYY-MM-DD');
    const results = await userStorage.list({
        $and: [
            { sponsorshipExpiresIn: { $exists: true } },
            { sponsorshipExpiresIn: today }
        ]
    });
    if (results.length > 0) {
        for (let index = 0; index < results.length; index++) {
            const element = results[index];

            const dataToSend = {
                isSponsored: false
            };

            await userStorage.updateOne({ _id: element._id }, dataToSend);
        }
    }
});

const searchDoctorWithFilters = async (param, user) => {
    const data = [];
    // return await getAllDoctorsWithInHospital()
    if (param.availability && param.inHospital && param.gender) {
        console.log('in main if statement')
        const doctorsWithInHospital = await getAllDoctorsWithInHospital();
        const doctorsWithGender = doctorsWithInHospital.filter(
            (x) => x.gender === param.gender
        );
        if (param.availableToday) {
            return getTodayAvailableDoctors(doctorsWithGender);
        } else if (param.availableNextThreeDays) {
            return getNextThreeDaysAvailableDoctors(doctorsWithGender);
        } else if (param.availableAnyDay) {
            return anydayAvailableDoctors(doctorsWithGender);
        }
    } else if (param.availability && param.inHospital) {
        console.log('in main else if requied availability & hospital')

        const doctorsWithInHospital = await getAllDoctorsWithInHospital();
        if (param.availableToday) {
            return getTodayAvailableDoctors(doctorsWithInHospital);
        } else if (param.availableNextThreeDays) {
            return getNextThreeDaysAvailableDoctors(doctorsWithInHospital);
        } else if (param.availableAnyDay) {
            return anydayAvailableDoctors(doctorsWithInHospital);
        }
    } else if (param.inHospital && param.gender) {
        console.log('in main else if requied gender & hospital')
        const doctorsWithInHospital = await getAllDoctorsWithInHospital();
        const doctorsWithGender = doctorsWithInHospital.filter(
            (x) => x.gender === param.gender
        );
        return Promise.resolve(doctorsWithGender);
    } else if (param.availability && param.gender) {
        console.log('in main else if requied availability & gender')

        const doctorsWithGender = await userStorage.list(
            { gender: param.gender, role: 'doctor' },
            userPopulation.list,
            { isSponsored: 1 }
        );
        if (param.availableToday) {
            return getTodayAvailableDoctors(doctorsWithGender);
        } else if (param.availableNextThreeDays) {
            return getNextThreeDaysAvailableDoctors(doctorsWithGender);
        } else if (param.availableAnyDay) {
            return anydayAvailableDoctors(doctorsWithGender);
        }
    } else if (param.availability) {
        if (param.availableToday) {
            return getTodayAvailableDoctors(doctorsWithGender);
        } else if (param.availableNextThreeDays) {
            return getNextThreeDaysAvailableDoctors(doctorsWithGender);
        } else if (param.availableAnyDay) {
            return anydayAvailableDoctors(doctorsWithGender);
        }
    } else if (param.gender) {
        return userStorage.list({ gender: param.gender, role: 'doctor' }, userPopulation.list, {
            isSponsored: 1
        });
    } else if (param.inHospital) {
        return getAllDoctorsWithInHospital();
    }
    else {
        return getAllDoctors();
    }
};

const getAllDoctors = () => {
    return userStorage.list(
        { suspend: false, $or: [{ role: 'doctor' }] },
        userPopulation.list,
        { isSponsored: 1 }
    );
};

const getAllDoctorsWithInHospital = async () => {
    const allHospital = await userStorage.list(
        {
            $and: [
                { role: 'hospital' },
                { doctors: { $elemMatch: { $exists: true } } }
            ]
        },
        userPopulation.list,
        { isSponsored: 1 }
    );
    const finalArray = [];
    for (let index = 0; index < allHospital.length; index++) {
        const element = allHospital[index];
        for (let indexj = 0; indexj < element.doctors.length; indexj++) {
            const elementDoctor = element.doctors[indexj];
            finalArray.push(elementDoctor);
        }
    }
    return finalArray;
};

const getTodayAvailableDoctors = async (doctors, today = new Date()) => {
    const availableDoctors = [];
    for (let index = 0; index < doctors.length; index++) {
        const element = doctors[index];
        const results = await unavailabilityService.getIsAvailable({
            date: today,
            doctor: element._id
        });

        if (results !== 'Sorry doctor saab is not available.') {
            availableDoctors.push(element);
        }
    }

    return availableDoctors;
};

const getNextThreeDaysAvailableDoctors = async (doctors) => {
    const firstDayDoctors = await getTodayAvailableDoctors(doctors);
    const secondDay = moment(new Date(), 'YYYY-MM-DD').add('days', 1);
    const secondDayDoctors = await getTodayAvailableDoctors(doctors, secondDay);
    const thirdDay = moment(new Date(), 'YYYY-MM-DD').add('days', 2);
    const thirdDayDoctors = await getTodayAvailableDoctors(doctors, thirdDay);

    const finalisedAvailableDoctors = (await firstDayDoctors).concat(
        secondDayDoctors,
        thirdDayDoctors
    );

    const uniqueDoctors = _.uniq(finalisedAvailableDoctors, '_id');

    return uniqueDoctors;
};

const anydayAvailableDoctors = (doctors) => {
    const idsOfDoctors = doctors.map((x) => x._id);

    return userStorage.list(
        { $and: [{ _id: { $in: idsOfDoctors } }, { hasPlanned: true }] },
        userPopulation.list,
        { isSponsored: 1 }
    );
};

module.exports = {
    // addScientist,
    updateUser,
    changeUserRole,
    blockUser,
    unblockUser,
    deleteUser,
    getAUser,
    // usersData,
    deleteUserForever,
    // readfile,
    // readExcelFile,
    // removeEsterik,
    // FcusersData,
    createHospital,
    markDoctorAsSponsored,
    searchDoctorWithFilters
};
