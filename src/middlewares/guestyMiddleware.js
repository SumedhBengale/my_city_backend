const axios = require('axios');
const format = require('date-fns/format');
const fs = require('fs');
const tokenFilePath = 'src/middlewares/accessToken.txt';
const { fetchAccessToken } = require('./tokenManager');
const { parseISO } = require('date-fns');

const fetchResidences = async ({ filterDataString, luxe, limit }) => {
    const GUESTY_ACCESS_TOKEN = fs.readFileSync(tokenFilePath, 'utf8');
    let filterData;
    if (filterDataString) {
        filterData = JSON.parse(filterDataString);
        console.log("Filter data", filterData)
        console.log("Luxe: ", luxe)
        console.log(typeof (luxe))
    } else {
        filterData = null;
    }
    try {
        let filter = '';

        if (filterData) {
            // Location
            if (filterData.location.city) {
                //If city is any or anywhere, don't include any location filter
                if (filterData.location.city == 'any' || filterData.location.city == 'anywhere') {
                } else if (filterData.location.city) {
                    filter += `&tags=${encodeURIComponent(filterData.location.city.toLowerCase())}`;
                }
            }

            // Date Range
            if (filterData.startDate && filterData.endDate) {
                //if both are the same date, don't include any date filter
                if (filterData.startDate == filterData.endDate) {
                } else {
                    console.log("Date range: ", filterData.startDate, filterData.endDate)
                    filter += `&checkIn=${encodeURIComponent(
                        //startDate in yyyy-mm-dd format
                        format(new Date(filterData.startDate), 'yyyy-MM-dd')
                    )}&checkOut=${encodeURIComponent(
                        //endDate in yyyy-mm-dd format
                        format(new Date(filterData.endDate), 'yyyy-MM-dd')
                    )}`;
                }
            }

            // Bedrooms
            if (filterData.bedrooms) {
                if (filterData.bedrooms == 'any') {
                    filter += `&numberOfBedrooms=0`;
                } else {
                    filter += `&numberOfBedrooms=${encodeURIComponent(filterData.bedrooms)}`;
                }
            }

            // Bathrooms
            if (filterData.bathrooms) {
                if (filterData.bathrooms == 'any') {
                    filter += `&numberOfBathrooms=0`;
                } else {
                    filter += `&numberOfBathrooms=${encodeURIComponent(filterData.bathrooms)}`;
                }
            }

            // Guests/Occupants
            if (filterData.guests) {
                if (filterData.guests == 'any') {
                    filter += `&minOccupancy=1`;
                } else {
                    filter += `&minOccupancy=${encodeURIComponent(filterData.guests)}`;
                }
            }

            // Price Range
            if (filterData.priceRange) {
                filter += `&minPrice=${encodeURIComponent(filterData.priceRange[0])}&maxPrice=${encodeURIComponent(filterData.priceRange[1])}`;
            }

            // Amenities
            if (filterData.amenities && filterData.amenities.length > 0) {
                const excludedAmenities = filterData.amenities.join('%2C');
                filter += `&excludeAmenities=${encodeURIComponent(excludedAmenities)}`;
            }

        }
        if (luxe === 'true') {
            filter += `&tags=luxe`;
        }
        if (limit) {
            //Limit the response to 100 residences
            filter += `&limit=${encodeURIComponent(limit)}`;
        }

        const response = await axios.get(process.env.GUESTY_BASE_URL + '/listings?' + filter, {
            headers: {
                'Authorization': `Bearer ${GUESTY_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        console.log(process.env.GUESTY_BASE_URL + '/listings?' + filter)
        // console.log("Residences", response.data)
        return response.data;
    } catch (err) {
        console.log(err)
        //If the status is 401, then console.log the error and return the status
        if (err.response.status === 401) {
            await fetchAccessToken();
        } else {
            return err;
        }
    }
};

//fetch by residence id

const fetchResidenceById = async (id) => {
    const GUESTY_ACCESS_TOKEN = fs.readFileSync(tokenFilePath, 'utf8');
    //Set the params for the request to include the financials in the response

    try {
        const response = await axios.get(process.env.GUESTY_BASE_URL + '/listings/' + id, {
            headers: {
                'Authorization': `Bearer ${GUESTY_ACCESS_TOKEN}`,
                'Accept': 'application/json',
                // 'Host': 'booking.guesty.com',
            }
        });

        return response.data;
    } catch (err) {
        //If the status is 401, then console.log the error and return the status
        if (err.response.status === 401) {
            await fetchAccessToken();
        } else {
            return err;
        }
    }
};

//Guesty Qoute API
const fetchQuote = async (residence, startDate, endDate, guestCount, coupon) => {

    const GUESTY_ACCESS_TOKEN = fs.readFileSync(tokenFilePath, 'utf8');
    try {
        const response = await axios.post(process.env.GUESTY_BASE_URL + '/reservations' + '/quotes', {
            checkInDateLocalized: format(parseISO(startDate), 'yyyy-MM-dd'),
            checkOutDateLocalized: format(parseISO(endDate), 'yyyy-MM-dd'),
            listingId: residence._id,
            guestsCount: guestCount === 'any' ? 1 : guestCount,
            //If coupon is null, don't include it in the request
            ...(coupon && { coupons: coupon }),
        }, {
            headers: {
                'Authorization': `Bearer ${GUESTY_ACCESS_TOKEN}`,
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (err) {
        console.log(err)
        //If the status is 401, then console.log the error and return the status
        if (err.response.status === 401) {
            await fetchAccessToken();
        } else {
            return err;
        }
    }
}

//Retrieve Quote from id
const retrieveQuote = async (id) => {
    const GUESTY_ACCESS_TOKEN = fs.readFileSync(tokenFilePath, 'utf8');
    try {
        const response = await axios.get(process.env.GUESTY_BASE_URL + '/reservations/quotes/' + id, {
            headers: {
                'Authorization': `Bearer ${GUESTY_ACCESS_TOKEN}`,
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (err) {
        //If the status is 401, then console.log the error and return the status
        if (err.response.status === 401) {
            await fetchAccessToken();
        } else {
            return err;
        }
    }
}


//fetch financials

const fetchFinancials = async (id) => {
    const GUESTY_ACCESS_TOKEN = fs.readFileSync(tokenFilePath, 'utf8');
    try {
        const response = await axios.get(process.env.GUESTY_BASE_URL + '/financials/listing/' + id, {
            headers: {
                'Authorization': `Bearer ${GUESTY_ACCESS_TOKEN}`,
            }
        });
        return response.data;
    } catch (err) {
        //If the status is 401, then console.log the error and return the status
        if (err.response.status === 401) {
            await fetchAccessToken();
        } else {
            return err;
        }
    }
};

//Get availability for a residence
const fetchAvailability = async (id, startDate, endDate) => {
    const GUESTY_ACCESS_TOKEN = fs.readFileSync(tokenFilePath, 'utf8');
    const query = `/calendar?from=${startDate}&to=${endDate}`
    try {
        const response = await axios.get(process.env.GUESTY_BASE_URL + '/listings/' + id + query, {
            headers: {
                'Authorization': `Bearer ${GUESTY_ACCESS_TOKEN}`,
            }
        });
        // console.log(response.data)
        return response.data;
    } catch (err) {
        //If the status is 401, then console.log the error and return the status
        if (err.response.status === 401) {
            await fetchAccessToken();
        } else {
            return err;
        }
    }
};

const fetchCities = async () => {
    const GUESTY_ACCESS_TOKEN = fs.readFileSync(tokenFilePath, 'utf8');
    try {
        const response = await axios.get(process.env.GUESTY_BASE_URL + '/listings/cities', {
            headers: {
                'Authorization': `Bearer ${GUESTY_ACCESS_TOKEN}`,
            }
        });
        // console.log("Cities", response.data)
        return response.data;
    } catch (err) {
        //If the status is 401, then console.log the error and return the status
        console.log(err)
        if (err.response.status === 401) {
            await fetchAccessToken();
        } else {
            return err;
        }
    }
};

//instantReservation
const instantReservation = async (quoteId, ratePlanId, ccToken, guest) => {
    const GUESTY_ACCESS_TOKEN = fs.readFileSync(tokenFilePath, 'utf8');
    console.log("Quote id: ", quoteId)
    console.log("Rate plan id: ", ratePlanId)
    console.log("CC Token: ", ccToken)
    console.log("Guest: ", guest)
    try {
        const response = await axios.post(process.env.GUESTY_BASE_URL + `/reservations/quotes/${quoteId}/instant`, {
            guest: { firstName: guest.firstName, lastName: guest.lastName, email: guest.email },
            ratePlanId: ratePlanId,
            ccToken: ccToken
        }, {
            headers: {
                'Authorization': `Bearer ${GUESTY_ACCESS_TOKEN}`,
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (err) {
        console.log(err)
        //If the status is 401, then console.log the error and return the status
        if (err.response.status === 401) {
            await fetchAccessToken();
        } else {
            return err;
        }
    }
}


const fetchQuoteById = async (id) => {
    const GUESTY_ACCESS_TOKEN = fs.readFileSync(tokenFilePath, 'utf8');
    try {
        const response = await axios.get(process.env.GUESTY_BASE_URL + '/reservations/quotes/' + id, {
            headers: {
                'Authorization': `Bearer ${GUESTY_ACCESS_TOKEN}`,
            }
        });
        return response.data;
    } catch (err) {
        //If the status is 401, then console.log the error and return the status
        if (err.response.status === 401) {
            await fetchAccessToken();
        } else {
            return err;
        }
    }
};

module.exports = {
    fetchResidences,
    fetchResidenceById,
    fetchFinancials,
    fetchAvailability,
    fetchCities,
    fetchQuote,
    instantReservation,
    fetchQuoteById,
    retrieveQuote
};