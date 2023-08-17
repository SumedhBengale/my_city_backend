// const mongoose = require('mongoose');

// // const residenceSchema = new mongoose.Schema({
// //   title: {
// //     type: String,
// //     required: true,
// //   },
// //   tag: {
// //     type: String,
// //   },
// //   description: {
// //     type: String,
// //   },
// //   address: {
// //     type: String,
// //     required: true,
// //   },
// //   type: {
// //     type: String,
// //     enum: ['Condominimum', 'Bunglow', 'Flat', 'Apartment', 'House', 'Villa'],
// //     required: true,
// //   },
// //   beds: {
// //     type: Number,
// //     required: true,
// //   },
// //   bedrooms: {
// //     type: Number,
// //     required: true,
// //   },
// //   guests: {
// //     type: Number,
// //     required: true,
// //   },
// //   bathrooms: {
// //     type: Number,
// //     required: true,
// //   },
// //   pricePerNight: {
// //     type: Number,
// //     required: true,
// //   },
// //   starRating: {
// //     type: Number,
// //     min: 1,
// //     max: 5,
// //   },
// //   images: {
// //     type: [String],
// //   },
// //   amenities: {
// //     type: [String],
// //     required: true,
// //   },
// //   rules: {
// //     smokingAllowed: {
// //       type: Boolean,
// //       default: false,
// //     },
// //     petsAllowed: {
// //       type: Boolean,
// //       default: false,
// //     },
// //     partiesAllowed: {
// //       type: Boolean,
// //       default: false,
// //     },
// //     childrenAllowed: {
// //       type: Boolean,
// //       default: false,
// //     },
// //   },
// //   listingId: {
// //     type: String,
// //     required: true,
// //     unique: true,
// //   },
// //   coordinate: {
// //     lat: {
// //       type: Number,
// //     },
// //     lng: {
// //       type: Number,
// //     },
// //   },
// // });


// const residenceSchema = new mongoose.Schema({
//   _id: String, // Using String as per the provided data

//   picture: {
//     thumbnail: String,
//     regular: String,
//     large: String,
//     caption: String,
//   },

//   terms: {
//     minNights: Number,
//     maxNights: Number,
//   },

//   publicDescription: {
//     summary: String,
//     space: String,
//     access: String,
//     interactionWithGuests: String,
//     neighborhood: String,
//     transit: String,
//     notes: String,
//     houseRules: String,
//   },

//   pms: {
//     active: Boolean,
//   },

//   tags: [String],

//   amenities: [String],
//   amenitiesNotIncluded: [String],

//   active: Boolean,
//   nickname: String,
//   title: String,
//   propertyType: String,
//   roomType: String,
//   bedrooms: Number,
//   bathrooms: Number,
//   beds: Number,
//   isListed: Boolean,

//   address: {
//     street: String,
//     city: String,
//     state: String,
//     zipcode: String,
//     country: String,
//     lat: Number,
//     lng: Number,
//     apt: String,
//     full: String,
//   },

//   defaultCheckInTime: String,
//   defaultCheckOutTime: String,
//   accommodates: Number,
//   timezone: String,

//   pictures: [
//     {
//       _id: String,
//       thumbnail: String,
//       id: String,
//       regular: String,
//       large: String,
//       original: String,
//       caption: String,
//       sort: Number,
//     },
//   ],

//   accountId: String,
//   customFields: [],
// });

// module.exports = mongoose.model('Residence', residenceSchema);
