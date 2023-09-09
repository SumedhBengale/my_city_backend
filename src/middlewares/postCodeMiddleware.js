
//Imports
const axios = require('axios');

//getAddresses
const fetchAddresses = async (postcode) => {
    const postCode = encodeURIComponent(postcode);
    const url = `${process.env.POSTCODE_URL}/${postCode}?api_key=${process.env.POSTCODE_API_KEY}`;
    console.log(url);

    try {
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json'
            }
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error in fetchAddresses:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

module.exports = fetchAddresses;