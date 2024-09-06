'use strict';

const bcryptjs = require('bcryptjs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const SwedishSSN = require('swedish-ssn-tool');
var swedenNationalId = require('sweden-national-id');
const RS = require('../../base/response/responseService');
const User = require('../storage/model/User');
const UserStorage = require('../storage/UserStorage');
const UserValidator = require('../storage/validation/UserValidator');
var firebase = require('firebase');
const userStorage = new UserStorage({
    Model: User,
    CustomValidator: UserValidator
});
const userPopulation = require('../storage/populate/userPopulation');
const fetch = require('node-fetch');
const { OAuth2Client } = require('google-auth-library');
const { result } = require('lodash');
const cheerio = require('cheerio');
const pmdcBaseUrl = 'https://www.pmc.gov.pk/Doctors/Details?regNo=';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userSignup = async (param) => {
    try {
        if (param.role === 'doctor') {
            return userStorage
                .store(
                    {
                        bio: param.bio,
                        dob: param.dob,
                        email: param.email,
                        experience: param.experience,
                        fee: param.fee,
                        firstName: param.firstName,
                        gender: param.gender,
                        lastName: param.lastName,
                        phoneNo: param.phoneNo,
                        pmdc: param.pmdc,
                        profileImg: param.profileImg,
                        role: param.role,
                        userName: await generateRandomUserName(param.firstName + param.lastName)
                    },
                    null,
                    userPopulation.find
                )
                .then(async (user) => {
                    console.log('user', user);
                    const token = authToken(user);
                    return Promise.resolve({ token: token, user });
                });
        } else {
            return userStorage
                .store(
                    {
                        dob: param.dob,
                        email: param.email,
                        firstName: param.firstName,
                        gender: param.gender,
                        lastName: param.lastName,
                        phoneNo: param.phoneNo,
                        profileImg: param.profileImg,
                        userName: await generateRandomUserName(param.firstName + param.lastName)
                    },
                    null,
                    userPopulation.find
                )
                .then(async (user) => {
                    console.log('user', user);
                    const token = authToken(user);
                    return Promise.resolve({ token: token, user });
                });
        }
    } catch (err) {
        return Promise.reject(RS.errorMessage(err.message));
    }
};

const userLogin = (param) => {
    var email = param.email.toLowerCase();
    return userStorage
        .findOne({ email: email }, userPopulation.find)
        .then(async (user) => {
            if (
                user &&
                bcryptjs.compareSync(param.password, user.password) &&
                !user.suspend
            ) {
                const token = authToken(user);
                return Promise.resolve({ token: token, user: user });
            } else {
                return Promise.reject(RS.errorMessage('Authentication Failed'));
            }
        });
};

const socialSignin = async (param, socialType) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { accessToken, userID } = param;
            console.log(accessToken, userID, 'this is req param');
            let dataToBeStored = {};

            const urlForFb = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email,picture.width(800).height(800)&access_token=${accessToken}`;
            await fetch(urlForFb, {
                method: 'GET'
            })
                .then((res) => res.json())
                .then(async (res) => {
                    console.log(res, 'this is response from graph api');
                    // return Promise.resolve({ user: res })
                    const fullName = res.name.split(' ');
                    dataToBeStored = {
                        facebookId: userID,
                        firstName: fullName[0],
                        lastName: fullName[1],
                        userName: fullName[0] + fullName[1],
                        email: res.email ? res.email : await generateRandomUserName() + '@gmail.com',
                        verified: true,
                        profileImg: res.picture.data.url,
                        role: param.role
                    };
                });

            let query = {};
            if (socialType === 'facebook') {
                query = {
                    $and: [{ facebookId: userID }, { facebookId: { $exists: true } }]
                };
            }
            const user = await userStorage.findOne(query, userPopulation.find);
            console.log(dataToBeStored.profileImg, 'img');
            if (user) {
                if (!user.suspend && user.role === param.role) {
                    const updateData = {
                        profileImg: dataToBeStored.profileImg
                    };
                    const updatedUser = await userStorage.update(
                        user._id,
                        updateData,
                        user,
                        userPopulation.find
                    );
                    const token = authToken(updatedUser);
                    resolve({ token: token, user: updatedUser });
                } else if (!user.suspend && user.role != param.role) {
                    reject(
                        RS.errorMessage(
                            `Your account has been used for ${user.role === 'user' ? 'patient' : user.role} previously, please try to sign-in with ${user.role === 'user' ? 'patient' : user.role} again.`
                        )
                    );
                }
                reject(
                    RS.errorMessage(
                        'Your account is block, please contact our support at E-Health'
                    )
                );
            } else {
                console.log(dataToBeStored.email, 'email');
                const userName = await generateRandomUserName(dataToBeStored.userName);
                dataToBeStored.userName = userName;
                const fireBaseResult = await firebase.auth().createUserWithEmailAndPassword(dataToBeStored.email, '12345678');
                let user;
                console.log(fireBaseResult, 'fire base result1');
                if (fireBaseResult) {
                    dataToBeStored.fireBaseId = fireBaseResult.user.uid;
                    console.log(dataToBeStored, 'dataToBeStored');
                    user = await userStorage.store(
                        dataToBeStored,
                        null,
                        userPopulation.find
                    );
                }
                console.log(fireBaseResult, 'fire base result');
                const token = authToken(user);
                resolve({ token: token, user: user });
            }
        } catch (error) {
            reject(RS.errorMessage(error.message));
        }
    });
};

const phoneNoSignin = async (param) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { phoneNo, userIdFromFireBase } = param;
            console.log(phoneNo, 'this is req param');
            let dataToBeStored = {};

            dataToBeStored = {
                phoneNo: phoneNo,
                fireBaseId: userIdFromFireBase,
                userName: '',
                role: param.role
            };

            const query = { phoneNo: phoneNo };

            const user = await userStorage.findOne(query, userPopulation.find);
            if (user) {
                if (!user.suspend) {
                    // const updateData = {
                    //     ...dataToBeStored
                    // };
                    // const updatedUser = await userStorage.update(
                    //     user._id,
                    //     updateData,
                    //     user,
                    //     userPopulation.find
                    // );
                    const token = authToken(user);
                    resolve({ token: token, user: user });
                }
                reject(
                    RS.errorMessage(
                        'Your account is block, please contact our support at E-Health'
                    )
                );
            } else {
                const userName = await generateRandomUserName();
                dataToBeStored.userName = userName;
                console.log(dataToBeStored, 'dataToBeStored');
                const user = await userStorage.store(
                    dataToBeStored,
                    null,
                    userPopulation.find
                );
                const token = authToken(user);
                resolve({ token: token, user: null });
            }
        } catch (error) {
            reject(RS.errorMessage(error.message));
        }
    });
};

const generateRandomUserName = async (name = 'user') => {
    const user = await userStorage.findOne({ userName: name }, userPopulation.find);
    let result = name;
    if (user) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (var i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        console.log('come on');
        return generateRandomUserName(result);
    } else {
        console.log('fuck off');
        return result;
    }
};

const socialSigninWithGoogle = async (param, socialType) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { accessToken, userID } = param;
            console.log(accessToken, userID, 'this is req param');
            let dataToBeStored = {};
            const payload = await client.verifyIdToken({
                idToken: accessToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const data = payload.getPayload();
            console.log(data, 'this is data');
            // if(data.phoneNo === null || data.phoneNo === undefined) {
            //   return reject(RS.errorMessage(
            //         'There is no phone # in your google id. please update info in your google id !'
            //     ))
            // }
            dataToBeStored = {
                googleId: userID,
                firstName: data.given_name,
                lastName: data.family_name,
                userName: data.name,
                email: data.email,
                verified: true,
                profileImg: data.picture,
                role: param.role
            };
            console.log(dataToBeStored, 'data to be stored');

            let query = {};
            if (socialType === 'google') {
                query = {
                    $and: [{ googleId: userID }, { googleId: { $exists: true } }]
                };
            }
            let user = await userStorage.findOne(query, userPopulation.find);
            if (user) {
                console.log(user._id, 'this is user');
                if (!user.suspend && user.role === param.role) {
                    const updateData = {
                        profileImg: dataToBeStored.profileImg

                    };
                    const updatedUser = await userStorage.update(
                        user._id,
                        updateData,
                        user,
                        userPopulation.find
                    );
                    const token = authToken(updatedUser);
                    resolve({ token: token, user: updatedUser });
                } else if (!user.suspend && user.role != param.role) {
                    reject(
                        RS.errorMessage(
                            `Your account has been used for ${user.role} previously, please try to sign-in with ${user.role} again.`
                        )
                    );
                }
                reject(
                    RS.errorMessage(
                        'Your account is block, please contact our support at E-Health'
                    )
                );
            } else {
                console.log(dataToBeStored.email, 'email');
                const userName = await generateRandomUserName(dataToBeStored.userName);
                dataToBeStored.userName = userName;
                //   let fireBaseResult = await  firebase.auth().createUserWithEmailAndPassword(dataToBeStored.email, '12345678')
                //   console.log(fireBaseResult, "this is firebase result")
                //   console.log(fireBaseResult,"fire base result1")
                //   if(fireBaseResult) {
                dataToBeStored.fireBaseId = 'not needed';
                console.log(dataToBeStored, 'dataToBeStored');
                user = await userStorage.store(
                    dataToBeStored,
                    null,
                    userPopulation.find
                );
                // }
                // console.log(fireBaseResult , 'fire base result')
                const token = authToken(user);
                resolve({ token: token, user: user });
            }
        } catch (error) {
            console.log(error, 'error');
            reject(RS.errorMessage(error.message));
        }
    });
};

const authToken = (user) => {
    return jwt.sign(
        {
            email: user.email,
            _id: user._id,
            role: user.role,
            uid: user.fireBaseId
        },
        process.env.SECRET_KEY,
        {
            expiresIn: process.env.TOKEN_EXPIRY_TIME
        }
    );
};

const userExistsWithFacebook = async (obj) => {
    const user = await userStorage.findOne({ facebookId: obj.id }, userPopulation.find);
    console.log(user, 'user found');
    if (user) {
        obj.exists = true;
        obj.token = authToken(user);
        obj.user = user;
    } else {
        obj.exists = false;
    }
    return Promise.resolve({ obj });
};

const userExistsWithGoogle = async (obj) => {
    const user = await userStorage.findOne({ googleId: obj.id }, userPopulation.find);
    if (user) {
        obj.exists = true;
        obj.token = authToken(user);
        obj.user = user;
    } else {
        obj.exists = false;
    }
    return obj;
};

const userExistsWithEmail = async (email) => {
    let userExist;
    const user = await userStorage.findOne({ email: email }, userPopulation.find);
    console.log(user, 'user');
    if (user) {
        userExist = true;
    } else {
        userExist = false;
    }
    return userExist;
};

const userExistsPhoneNo = async (obj) => {
    const user = await userStorage.findOne({ phoneNo: obj.id }, userPopulation.find);
    if (user) {
        obj.exists = true;
        obj.token = authToken(user);
        obj.user = user;
    } else {
        obj.exists = false;
    }
    return obj;
};

const pmdcVerification = async (pmdcNumber) => {
    const form = new FormData();
    form.append('');
    await fetch(pmdcBaseUrl + pmdcNumber, {
        method: 'GET',
        body: {

        }
    }).then((res) => {
        console.log(res, 'res');
        const $ = cheerio.load(res);
        console.log($.html(), 'cheerio');
    })
        .catch(err => {
            console.log(err, 'error');
        });
};

const generateAuthToken = () => {
    return new Promise((resolve, reject) => {
        resolve(authToken({
            email: 'shahzaibkhan@gmail.com',
            _id: '5f94a0c7c9a3cb001ff6bd4b',
            role: 'user',
            uid: 'user.fireBaseId'
        }));
    });
};

module.exports = {
    userSignup,
    userLogin,
    socialSignin,
    authToken,
    userExistsWithEmail,
    socialSigninWithGoogle,
    userExistsWithFacebook,
    userExistsWithGoogle,
    userExistsPhoneNo,
    phoneNoSignin,
    pmdcVerification,
    generateAuthToken
};
