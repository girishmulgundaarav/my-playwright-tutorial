/*
Test: create booking
Request type: Post
Request body: randome/dynamic data(faker)

Pre-requistes: 
----------------
Install faker-js library for generating dynamic data
  npm install @faker-js/faker

Install Luxon is a library for working with dates and times in JavaScript.
  npm install luxon


Add url to playwright.config.ts file
	baseURL: 'https://restful-booker.herokuapp.com'
 

*/

import { test, expect } from "@playwright/test"
import {faker} from "@faker-js/faker"
import {DateTime} from 'luxon';



test("Create Post request using json file body", async({ request }) => {

    //data generation using faker
    const firstname=faker.person.firstName();
    const lastName=faker.person.lastName();
    const totalprice=faker.number.int({min:100, max:5000});
    const depositpaid=faker.datatype.boolean();

    const checkindate=DateTime.now().toFormat("yyyy-MM-dd");
    const checkoutdate=DateTime.now().plus({day:5}).toFormat("yyyy-MM-dd");

    const additionalneeds="super bowls";


    //request body
    const requestBody = {
        firstname: firstname,
        lastname: lastName,
        totalprice: totalprice,
        depositpaid: depositpaid,
        bookingdates: {
            checkin: checkindate, //yyyy-mm-dd
            checkout: checkoutdate,
        },
        additionalneeds: additionalneeds,
    }

    
    // send post request

    const response=await request.post("/booking",{data:requestBody});

    const responseBody=await response.json();  // Extractred response
    console.log(responseBody);
    
    //validate status
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    //validate response body attributes
    expect(responseBody).toHaveProperty("bookingid")
    expect(responseBody).toHaveProperty("booking")
    expect(responseBody).toHaveProperty("booking.additionalneeds")

    //validate booking details
    const booking=responseBody.booking;


    expect(booking).toMatchObject({
        firstname: requestBody.firstname,
        lastname: requestBody.lastname,
        totalprice: requestBody.totalprice,
        depositpaid: requestBody.depositpaid,
        additionalneeds: requestBody.additionalneeds
    });

    //validate booking dates (nested json object)
    expect(booking.bookingdates).toMatchObject({
            checkin: requestBody.bookingdates.checkin,
            checkout: requestBody.bookingdates.checkout,
        });

})