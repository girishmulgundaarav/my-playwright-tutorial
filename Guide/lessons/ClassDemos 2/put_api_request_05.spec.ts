/*

Pre-requisites:
    data: json file
    create token

1) Create a booking (Post) ---> bookingId
2) Update booking (Put)   // required token

*/

import { test, expect } from "@playwright/test";
import fs from 'fs';

//utility function returns json file data
function readJson(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

test('Update Booking(Put)', async ({ request }) => {

    //1) Create a booking (Post) ---> bookingId

    const requestBody = readJson('testdata/post_request_body.json');
    
    const createResponse = await request.post('/booking', { data:requestBody });

    //expect(createResponse.ok()).toBeTruthy();

    const responsebody = await createResponse.json();

    console.log(responsebody);
    const bookingid = responsebody.bookingid;   // extracting bookingid from the response body
    console.log("Booking id======>", bookingid);

   

    //2) Update booking (Put)   // required token

    //token creation

    const tokenrequestBody = readJson('testdata/token_request_body.json');
    const tokenresponse = await request.post('/auth', { data: tokenrequestBody });
    expect(tokenresponse.ok()).toBeTruthy();

    const tokenresponsebody = await tokenresponse.json();
    const token = tokenresponsebody.token;
    console.log("Token ======>", token);


    //sending update(Put)
     const updateRequestbody = readJson('testdata/put_request_body.json');
    const updateresponse=await request.put(`/booking/${bookingid}`,
                       {
                        headers:{"Cookie":`token=${token}`},
                        data:updateRequestbody
                        }
                     );

    expect(updateresponse.ok()).toBeTruthy();
    expect(updateresponse.status()).toBe(200);

    const updateresponsebody=await updateresponse.json();
    console.log(updateresponsebody)
     console.log("Booking details updated succesfully...")               
    

})



