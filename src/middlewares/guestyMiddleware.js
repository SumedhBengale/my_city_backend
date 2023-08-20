const axios = require('axios');
const format = require('date-fns/format');

//Function to fetch the residences from Guesty API

const fetchResidences = async (filterDataString) => {
    let filterData;
    if(filterDataString) {
    filterData = JSON.parse(filterDataString);
    }else{
        filterData = null;
    }
    try {
        let filter = '';

        if (filterData) {
            // Location
            if (filterData.location.city) {
                console.log("Location: ", filterData.location)
                filter += `&city=${encodeURIComponent(filterData.location.city)}`;
                //state
                if (filterData.location.state) {
                    filter += `&state=${encodeURIComponent(filterData.location.state)}`;
                }
                //country
                if (filterData.location.country) {
                    filter += `&country=${encodeURIComponent(filterData.location.country)}`;
                }
            }

            // Date Range
            if (filterData.startDate && filterData.endDate) {
                //if both are the same date, don't include any date filter
                if(filterData.startDate == filterData.endDate){
                }else{
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
                if(filterData.bedrooms == 'any'){
                    filter += `&numberOfBedrooms=1`;
                }else{
                filter += `&numberOfBedrooms=${encodeURIComponent(filterData.bedrooms)}`;
                }
            }

            // Bathrooms
            if (filterData.bathrooms) {
                if(filterData.bathrooms == 'any'){
                    filter += `&numberOfBathrooms=1`;
                }else{
                filter += `&numberOfBathrooms=${encodeURIComponent(filterData.bathrooms)}`;
                }
            }

            // Guests/Occupants
            if (filterData.guests) {
                if(filterData.guests == 'any'){
                    filter += `&minOccupancy=1`;
                }else{
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

        const response = await axios.get(process.env.GUESTY_BASE_URL + '/listings?' + filter, {
            headers: {
                'Authorization': `Bearer ${process.env.GUESTY_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        console.log(process.env.GUESTY_BASE_URL + '/listings?' + filter)
        // console.log("Residences", response.data)
        return response.data;
    } catch (err) {
        console.error(err);
        return err;
    }
};

//fetch by residence id

const fetchResidenceById = async (id) => {

    //Set the params for the request to include the financials in the response

    try {
        const response = await axios.get(process.env.GUESTY_BASE_URL + '/listings/' + id , {
            headers: {
                'Authorization': `Bearer ${process.env.GUESTY_ACCESS_TOKEN}`,
                'Accept': 'application/json',
                // 'Host': 'booking.guesty.com',
            }
        });

        return response.data;
    } catch (err) {
        console.error(err);
        return err;
    }
};

//Guesty Qoute API
const fetchQuote = async (residence, startDate, endDate, guestsCount) => {
    try{
        const response = await axios.post(process.env.GUESTY_BASE_URL + '/reservations'+'/quotes',{
            checkInDateLocalized: format(new Date(startDate), 'yyyy-MM-dd'),
            checkOutDateLocalized: format(new Date(endDate), 'yyyy-MM-dd'),
            listingId: residence._id,
            guestsCount: guestsCount === 'any' ? 1 : guestsCount,
        }, {
            headers:{
                'Authorization': `Bearer ${process.env.GUESTY_ACCESS_TOKEN}`,
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }catch(err){
        console.error(err.data);
        return err;
    }
}


//fetch financials

const fetchFinancials = async (id) => {
    try {
        const response = await axios.get(process.env.GUESTY_BASE_URL + '/financials/listing/' + id, {
            headers: {
                'Authorization': `Bearer ${process.env.GUESTY_ACCESS_TOKEN}`,
            }
        });
        return response.data;
    } catch (err) {
        console.error(err);
        return err;
    }
};

//Get availability for a residence
const fetchAvailability = async (id, startDate, endDate) => {
    const query = `/calendar?from=${startDate}&to=${endDate}`
    try {
        const response = await axios.get(process.env.GUESTY_BASE_URL + '/listings/'+ id + query, {
            headers: {
                'Authorization': `Bearer ${process.env.GUESTY_ACCESS_TOKEN}`,
            }
        });
        // console.log(response.data)
        return response.data;
    } catch (err) {
        console.error(err);
    }
};

const fetchCities = async () => {
    try {
        const response = await axios.get(process.env.GUESTY_BASE_URL + '/listings/cities', {
            headers: {
                'Authorization': `Bearer ${process.env.GUESTY_ACCESS_TOKEN}`,
            }
        });
        // console.log("Cities", response.data)
        return response.data;
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    fetchResidences,
    fetchResidenceById,
    fetchFinancials,
    fetchAvailability,
    fetchCities,
    fetchQuote,
};