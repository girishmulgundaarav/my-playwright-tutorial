/*
1) create new booking
2) get booking
3) update booking  ( token)
4) delete booking  (token)
*/

import { test, expect } from "@playwright/test";
import fs from 'fs';

// Utility function to read JSON data from file
function readJson(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

test('Delete booking(end-to-end', async ({ request }) => {

    //1) create new booking

    const postrequestBody = readJson('testdata/post_request_body.json');
    const postresponse = await request.post("/booking", { data: postrequestBody });
    const postresponseBody = await postresponse.json();  // Extractred response
    console.log(postresponseBody);
    const bookingid = postresponseBody.bookingid;
    console.log("Booking is created.....");
    console.log("Booking id===>", bookingid);

    //2) get booking

    const getresponse = await request.get(`/booking/${bookingid}`);
    const getresponsebody = await getresponse.json();
    console.log("Booking details are......");
    console.log(getresponsebody);


    //3) update booking  ( token)


    //creating token

    const tokenrequestBody = readJson('testdata/token_request_body.json');
    const tokenresponse = await request.post('/auth', { data: tokenrequestBody });
    const tokenresponsebody = await tokenresponse.json();
    const token = tokenresponsebody.token;
    console.log("Token ======>", token);

    //sending put request
    const updateRequestbody = readJson('testdata/put_request_body.json');
    const updateresponse = await request.put(`/booking/${bookingid}`,
        {
            headers: { "Cookie": `token=${token}` },
            data: updateRequestbody
        }
    );

    const updateresponsebody = await updateresponse.json();
    console.log("Booking details updated succesfully...")
    console.log(updateresponsebody)

    //4) delete booking  

    const deleteresponse=await request.delete(`/booking/${bookingid}`,
        {
            headers: { "Cookie": `token=${token}` },
        });

    expect(deleteresponse.statusText()).toBe("Created");
    expect(deleteresponse.status()).toBe(201)

    console.log("Booking are deleted successfully.....")


})